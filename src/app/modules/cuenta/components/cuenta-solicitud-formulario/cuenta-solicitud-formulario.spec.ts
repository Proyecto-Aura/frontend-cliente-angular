import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuentaSolicitudFormulario } from './cuenta-solicitud-formulario';
import { PEDIDOS_FORM_DEMO } from '../../testing/solicitudes-data';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';
import { LIMITE_EVIDENCIA_BYTES } from '../../models/solicitud-formulario.model';

describe('CuentaSolicitudFormulario', () => {
  prepararDialogoEnPruebas();
  let component: CuentaSolicitudFormulario;
  let fixture: ComponentFixture<CuentaSolicitudFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaSolicitudFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaSolicitudFormulario);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pedidos', PEDIDOS_FORM_DEMO);
    fixture.componentRef.setInput('demostracion', true);
    await fixture.whenStable();
  });

  const raiz = () => fixture.nativeElement as HTMLElement;
  const cambiar = async (selector: string, valor: string) => {
    const campo = raiz().querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      selector,
    )!;
    if (campo instanceof HTMLSelectElement && ![...campo.options].some((o) => o.value === valor))
      campo.add(new Option(valor, valor));
    campo.value = valor;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    if (campo instanceof HTMLSelectElement)
      campo.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
  };
  const adjuntar = async (archivo?: File) => {
    const campo = raiz().querySelector<HTMLInputElement>('#solicitud-evidencia')!;
    Object.defineProperty(campo, 'files', { configurable: true, value: archivo ? [archivo] : [] });
    campo.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
  };
  const enviar = async () => {
    raiz()
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };
  const completar = async (descripcion = 'El producto llegó con la bolsa rota.') => {
    await cambiar('#solicitud-motivo', 'Otro');
    await cambiar('#solicitud-descripcion', descripcion);
    await adjuntar(new File(['%PDF-1.4 ejemplo'], 'evidencia.pdf', { type: 'application/pdf' }));
  };

  it('preselects only an eligible requested id and never silently replaces an unavailable selection', async () => {
    fixture.componentRef.setInput('pedidoInicialId', 502);
    await fixture.whenStable();
    expect(raiz().querySelector<HTMLSelectElement>('#solicitud-pedido_id')!.value).toBe('502');
    fixture.componentRef.setInput('pedidoInicialId', 506);
    await fixture.whenStable();
    expect(raiz().querySelector<HTMLSelectElement>('#solicitud-pedido_id')!.value).toBe('');
  });

  it('keeps real submission unavailable and exposes loading, retry and order pagination', async () => {
    fixture.componentRef.setInput('envioDisponible', false);
    fixture.componentRef.setInput('cargandoPedidos', true);
    await fixture.whenStable();
    expect(raiz().textContent).toContain('Cargando y verificando');
    expect(raiz().querySelector<HTMLSelectElement>('#solicitud-pedido_id')!.disabled).toBe(true);
    fixture.componentRef.setInput('cargandoPedidos', false);
    fixture.componentRef.setInput('errorPedidos', 'No pudimos cargar tus pedidos.');
    await fixture.whenStable();
    const retry = vi.fn();
    component.reintentarPedidos.subscribe(retry);
    raiz().querySelector<HTMLButtonElement>('[role=alert] button')!.click();
    expect(retry).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('errorPedidos', null);
    fixture.componentRef.setInput('totalPaginasPedidos', 2);
    await fixture.whenStable();
    const pagina = vi.fn();
    component.cambiarPaginaPedidos.subscribe(pagina);
    const botones = raiz().querySelectorAll<HTMLButtonElement>('nav button');
    expect(botones[0].disabled).toBe(true);
    botones[1].click();
    expect(pagina).toHaveBeenCalledExactlyOnceWith(2);
    expect(raiz().querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
    const validado = vi.fn();
    component.validado.subscribe(validado);
    await enviar();
    expect(validado).not.toHaveBeenCalled();
  });

  it('shows the named form and offers only paid eligible orders without another request', () => {
    const selector = raiz().querySelector<HTMLSelectElement>('#solicitud-pedido_id')!;
    expect([...selector.options].map((o) => o.value)).toEqual(['', '501', '502', '503']);
    expect(selector.value).toBe('501');
    expect(document.activeElement).toBe(selector);
    expect(raiz().querySelector('dialog')?.getAttribute('aria-labelledby')).toBe(
      'nueva-solicitud-titulo',
    );
    expect(raiz().querySelector<HTMLSelectElement>('#solicitud-producto')?.disabled).toBe(true);
    expect(raiz().querySelector<HTMLInputElement>('#solicitud-importe')?.readOnly).toBe(true);
  });

  it('shows required errors and focuses the first invalid field on submit', async () => {
    const validado = vi.fn();
    component.validado.subscribe(validado);
    await enviar();
    expect(raiz().querySelector('#solicitud-motivo-error')?.textContent).toContain(
      'Selecciona un motivo',
    );
    expect(raiz().querySelector('#solicitud-descripcion-error')?.textContent).toContain(
      'mínimo 10',
    );
    expect(raiz().querySelector('#solicitud-evidencia-error')?.textContent).toContain('Adjunta');
    expect(document.activeElement?.id).toBe('solicitud-motivo');
    expect(validado).not.toHaveBeenCalled();
  });

  it.each([9, 1001])('rejects a trimmed description of %i characters', async (longitud) => {
    await completar(`  ${'x'.repeat(longitud)}  `);
    await enviar();
    expect(raiz().querySelector('#solicitud-descripcion')?.getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(document.activeElement?.id).toBe('solicitud-descripcion');
  });

  it.each([10, 1000])(
    'accepts the trimmed description boundary of %i characters',
    async (longitud) => {
      const validado = vi.fn();
      component.validado.subscribe(validado);
      await completar(`  ${'x'.repeat(longitud)}  `);
      await enviar();
      expect(validado).toHaveBeenCalledOnce();
      expect(validado.mock.calls[0][0].descripcion).toHaveLength(longitud);
    },
  );

  it('validates whitespace-only reasons and the maximum 150 characters', async () => {
    await completar();
    await cambiar('#solicitud-motivo', '    ');
    await enviar();
    expect(raiz().querySelector('#solicitud-motivo-error')?.textContent).toContain('Selecciona');
    await cambiar('#solicitud-motivo', 'x'.repeat(151));
    await enviar();
    expect(raiz().querySelector('#solicitud-motivo-error')?.textContent).toContain('150');
  });

  it('rejects an injected order id and updates the read-only amount on legitimate selection', async () => {
    const validado = vi.fn();
    component.validado.subscribe(validado);
    await completar();
    await cambiar('#solicitud-pedido_id', '504');
    await enviar();
    expect(validado).not.toHaveBeenCalled();
    expect(raiz().querySelector('#solicitud-pedido-error')?.textContent).toContain('elegible');
    await cambiar('#solicitud-pedido_id', '502');
    expect(raiz().querySelector<HTMLInputElement>('#solicitud-importe')?.value).toMatch(/19\.90/);
  });

  it.each(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])(
    'accepts %s evidence',
    async (tipo) => {
      const validado = vi.fn();
      component.validado.subscribe(validado);
      await completar();
      await adjuntar(new File(['contenido'], 'evidencia', { type: tipo }));
      await enviar();
      expect(validado).toHaveBeenCalledOnce();
    },
  );

  it.each([
    ['image/svg+xml', 10, 'PDF, JPG, PNG o WEBP'],
    ['application/pdf', 0, 'vacío'],
    ['application/pdf', LIMITE_EVIDENCIA_BYTES, 'menos de 5'],
    ['application/pdf', LIMITE_EVIDENCIA_BYTES + 1, 'menos de 5'],
  ] as const)('rejects invalid evidence (%s, %i bytes)', async (tipo, tamano, mensaje) => {
    const validado = vi.fn();
    component.validado.subscribe(validado);
    await completar();
    await adjuntar(new File([new Uint8Array(tamano)], 'archivo', { type: tipo }));
    await enviar();
    expect(raiz().querySelector('#solicitud-evidencia-error')?.textContent).toContain(mensaje);
    expect(validado).not.toHaveBeenCalled();
  });

  it('emits only the known request fields, prevents repeated submission and never claims a saved request', async () => {
    const validado = vi.fn();
    component.validado.subscribe(validado);
    await completar();
    await cambiar('#solicitud-motivo', '  Otro  ');
    raiz().querySelector<HTMLInputElement>('#solicitud-importe')!.value = '1';
    await enviar();
    await enviar();
    expect(validado).toHaveBeenCalledOnce();
    expect(Object.keys(validado.mock.calls[0][0]).sort()).toEqual([
      'descripcion',
      'evidencia',
      'motivo',
      'pedido_id',
    ]);
    expect(validado.mock.calls[0][0]).toMatchObject({ pedido_id: 501, motivo: 'Otro' });
    expect(raiz().querySelector('[role="status"]')?.textContent).toContain(
      'No se ha enviado ni guardado',
    );
  });

  it('allows removing evidence and validates it again', async () => {
    await completar();
    const quitar = [...raiz().querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Quitar archivo'),
    )!;
    quitar.click();
    await fixture.whenStable();
    await enviar();
    expect(raiz().querySelector('#solicitud-evidencia-error')?.textContent).toContain('Adjunta');
  });

  it('disables submission without eligible orders or while sending', async () => {
    const validado = vi.fn();
    component.validado.subscribe(validado);
    fixture.componentRef.setInput('enviando', true);
    await fixture.whenStable();
    expect(raiz().querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(true);
    expect(raiz().querySelector<HTMLSelectElement>('#solicitud-motivo')?.disabled).toBe(true);
    fixture.componentRef.setInput('enviando', false);
    fixture.componentRef.setInput('pedidos', []);
    await fixture.whenStable();
    await enviar();
    expect(raiz().textContent).toContain('No hay pedidos pagados disponibles');
    expect(raiz().querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(true);
    expect(validado).not.toHaveBeenCalled();
  });
});
