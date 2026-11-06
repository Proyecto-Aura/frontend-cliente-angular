import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { CuentaNuevaSolicitud } from './cuenta-nueva-solicitud';
import { CuentaSolicitudFormulario } from '../cuenta-solicitud-formulario/cuenta-solicitud-formulario';
import { PEDIDO_DETALLE_PRUEBA, PEDIDO_RESUMEN_PRUEBA } from '../../testing/pedidos-data';
import { SOLICITUD_REGISTRADA_PRUEBA } from '../../testing/reembolsos-data';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';

describe('CuentaNuevaSolicitud: envío real', () => {
  prepararDialogoEnPruebas();
  let fixture: ComponentFixture<CuentaNuevaSolicitud>;
  let http: HttpTestingController;
  const pedidosUrl = `${environment.apiUrl}/portal/pedidos`;
  const url = `${environment.apiUrl}/portal/reembolsos`;
  const raiz = () => fixture.nativeElement as HTMLElement;
  const formulario = () =>
    fixture.debugElement.query(By.directive(CuentaSolicitudFormulario))
      .componentInstance as CuentaSolicitudFormulario;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CuentaNuevaSolicitud);
    await vi.waitFor(() => {
      const reqs = http.match((r) => r.url === pedidosUrl);
      expect(reqs).toHaveLength(1);
      reqs[0].flush({
        data: [PEDIDO_RESUMEN_PRUEBA],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });
      http.expectOne(`${pedidosUrl}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    });
    await fixture.whenStable();
    const motivo = raiz().querySelector<HTMLSelectElement>('#solicitud-motivo')!;
    motivo.value = 'Otro';
    motivo.dispatchEvent(new Event('input', { bubbles: true }));
    motivo.dispatchEvent(new Event('change', { bubbles: true }));
    const descripcion = raiz().querySelector<HTMLTextAreaElement>('textarea')!;
    descripcion.value = 'Evidencia exclusiva de pruebas locales.';
    descripcion.dispatchEvent(new Event('input', { bubbles: true }));
    const archivo = raiz().querySelector<HTMLInputElement>('input[type=file]')!;
    Object.defineProperty(archivo, 'files', {
      configurable: true,
      value: [new File(['prueba'], 'prueba.pdf', { type: 'application/pdf' })],
    });
    archivo.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
  });
  afterEach(() => {
    http.verify();
    fixture.destroy();
  });
  const enviar = () =>
    raiz()
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

  it.each([
    ['motivo vacío', '#solicitud-motivo', '', '#solicitud-motivo-error', 'Selecciona un motivo.'],
    [
      'descripción corta',
      '#solicitud-descripcion',
      '123456789',
      '#solicitud-descripcion-error',
      'mínimo 10',
    ],
    ['sin evidencia', '#solicitud-evidencia', '', '#solicitud-evidencia-error', 'Adjunta'],
  ])(
    'RF-B39: %s muestra su error y no hace POST aunque los demás campos sean válidos',
    async (_escenario, selector, valor, selectorError, mensaje) => {
      const campo = raiz().querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(selector)!;
      if (campo instanceof HTMLInputElement && campo.type === 'file') {
        Object.defineProperty(campo, 'files', { configurable: true, value: [] });
        campo.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        campo.value = valor;
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        campo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await fixture.whenStable();
      enviar();
      await fixture.whenStable();
      const error = raiz().querySelector(selectorError)!;
      expect(error.textContent).toContain(mensaje);
      expect(error.getAttribute('role')).toBe('alert');
      expect(error.classList.contains('hidden')).toBe(false);
      expect(campo.getAttribute('aria-invalid')).toBe('true');
      http.expectNone((r) => r.method === 'POST');
      expect(TestBed.inject(Avisos).actual()).toBeNull();
    },
  );

  it.each([
    ['image/svg+xml', 10, 'PDF, JPG, PNG o WEBP'],
    ['application/pdf', 5 * 1024 * 1024 + 1, 'menos de 5'],
  ] as const)(
    'RF-B39: rechaza evidencia %s de %i bytes antes de llamar a la API',
    async (tipo, bytes, mensaje) => {
      const archivo = raiz().querySelector<HTMLInputElement>('#solicitud-evidencia')!;
      Object.defineProperty(archivo, 'files', {
        configurable: true,
        value: [new File([new Uint8Array(bytes)], 'evidencia', { type: tipo })],
      });
      archivo.dispatchEvent(new Event('change', { bubbles: true }));
      await fixture.whenStable();
      enviar();
      await fixture.whenStable();
      const error = raiz().querySelector('#solicitud-evidencia-error')!;
      expect(error.textContent).toContain(mensaje);
      expect(error.getAttribute('role')).toBe('alert');
      http.expectNone((r) => r.method === 'POST');
    },
  );

  it('guards duplicate submits and every close action while sending, confirming only after the response', async () => {
    const registrada = vi.fn(),
      cerrar = vi.fn();
    fixture.componentInstance.registrada.subscribe(registrada);
    fixture.componentInstance.cerrar.subscribe(cerrar);
    enviar();
    const req = http.expectOne(url);
    enviar();
    http.expectNone(url);
    expect(registrada).not.toHaveBeenCalled();
    await vi.waitFor(() =>
      expect(raiz().querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true),
    );
    const dialogo = raiz().querySelector('dialog')!;
    const escape = new Event('cancel', { cancelable: true });
    dialogo.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(true);
    expect(dialogo.open).toBe(true);
    expect(cerrar).not.toHaveBeenCalled();
    expect(
      raiz().querySelector<HTMLButtonElement>('button[aria-label="Cerrar nueva solicitud"]')!
        .disabled,
    ).toBe(true);
    expect(raiz().querySelector<HTMLTextAreaElement>('textarea')!.disabled).toBe(true);
    const confirmada = { ...SOLICITUD_REGISTRADA_PRUEBA, monto: 9.5 };
    req.flush(confirmada, { status: 201, statusText: 'Created' });
    await fixture.whenStable();
    expect(registrada).toHaveBeenCalledExactlyOnceWith(confirmada);
    expect(TestBed.inject(Avisos).actual()?.titulo).toContain('REF-PRUEBA-001');
    expect(TestBed.inject(Avisos).actual()?.detalle).toContain('Pendiente');
    enviar();
    http.expectNone(url);
  });

  it('keeps the fields and file on a validation error and accepts an explicit retry without editing', async () => {
    enviar();
    http
      .expectOne(url)
      .flush({ message: 'La evidencia no es válida.' }, { status: 400, statusText: 'Bad request' });
    await fixture.whenStable();
    expect(raiz().querySelector('[role=alert]')!.textContent).toContain(
      'La evidencia no es válida.',
    );
    expect(raiz().querySelector<HTMLTextAreaElement>('textarea')!.value).toBe(
      'Evidencia exclusiva de pruebas locales.',
    );
    expect(raiz().querySelector<HTMLSelectElement>('#solicitud-motivo')!.value).toBe('Otro');
    expect(raiz().textContent).toContain('prueba.pdf');
    expect(raiz().querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(false);
    enviar();
    http.expectOne(url).flush(SOLICITUD_REGISTRADA_PRUEBA, { status: 201, statusText: 'Created' });
    await fixture.whenStable();
    expect(TestBed.inject(Avisos).actual()).not.toBeNull();
  });

  it.each([
    { message: ['motivo should not be empty'] },
    { message: 'Validation failed (expected size is less than 5242880)' },
  ])(
    'RF-B39: muestra en español los errores técnicos 400 de los validadores del backend',
    async (respuesta) => {
      enviar();
      http.expectOne(url).flush(respuesta, { status: 400, statusText: 'Bad request' });
      await fixture.whenStable();
      const mensaje = raiz().querySelector('[role="alert"]')!.textContent;
      expect(mensaje).toContain('Revisa el motivo, la descripción y la evidencia adjunta.');
      expect(mensaje).not.toMatch(/should not|Validation failed/);
      expect(TestBed.inject(Avisos).actual()).toBeNull();
      http.expectNone(url);
    },
  );

  it.each([
    [401, 'Unauthorized', 'Tu sesión ha vencido.'],
    [403, 'Forbidden', 'No tienes permiso para solicitar este reembolso.'],
    [404, 'Pedido no encontrado', 'El pedido ya no está disponible para tu cuenta.'],
    [
      409,
      'El pedido ya tiene una solicitud de reembolso.',
      'El pedido ya tiene una solicitud de reembolso.',
    ],
    [500, 'INTERNAL_STORAGE_SECRET', 'No pudimos confirmar si se registró la solicitud.'],
  ] as const)(
    'does not announce success or blindly retry on status %s',
    async (status, mensajeServidor, esperado) => {
      const registrada = vi.fn(),
        revisar = vi.fn(),
        cerrar = vi.fn();
      fixture.componentInstance.registrada.subscribe(registrada);
      fixture.componentInstance.revisarPedidos.subscribe(revisar);
      fixture.componentInstance.cerrar.subscribe(cerrar);
      enviar();
      http.expectOne(url).flush({ message: mensajeServidor }, { status, statusText: 'Error' });
      await fixture.whenStable();
      expect(raiz().querySelector('[role=alert]')).not.toBeNull();
      const error = raiz().querySelector<HTMLElement>('[role="alert"]')!;
      expect(error.textContent).toContain(esperado);
      expect(error.textContent).not.toContain('INTERNAL_STORAGE_SECRET');
      expect(document.activeElement).toBe(error);
      expect(raiz().querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
      expect(registrada).not.toHaveBeenCalled();
      expect(TestBed.inject(Avisos).actual()).toBeNull();
      enviar();
      http.expectNone(url);
      formulario().cerrar.emit();
      expect(revisar).toHaveBeenCalledOnce();
      expect(cerrar).toHaveBeenCalledOnce();
    },
  );

  it('requires reviewing the order after a network error without losing the draft or retrying automatically', async () => {
    enviar();
    http.expectOne(url).error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(raiz().querySelector('[role=alert]')!.textContent).toContain('No pudimos confirmar');
    expect(raiz().querySelector<HTMLTextAreaElement>('textarea')!.value).toContain(
      'Evidencia exclusiva',
    );
    enviar();
    http.expectNone(url);
  });
});
