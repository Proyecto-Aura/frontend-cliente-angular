import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { PAGINA_NOTIFICACIONES, NOTIFICACION_APROBADA } from '../../testing/notificaciones-data';
import { SOLICITUD_REGISTRADA_PRUEBA } from '../../testing/reembolsos-data';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';
import { CuentaNotificaciones } from './cuenta-notificaciones';

describe('CuentaNotificaciones', () => {
  prepararDialogoEnPruebas();
  let fixture: ComponentFixture<CuentaNotificaciones>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/portal/notificaciones`;
  const raiz = () => fixture.nativeElement as HTMLElement;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CuentaNotificaciones);
  });
  afterEach(() => {
    http.verify({ ignoreCancelled: true });
    vi.restoreAllMocks();
  });
  const cargar = async () => {
    http.expectOne((r) => r.url === url).flush(PAGINA_NOTIFICACIONES);
    await fixture.whenStable();
  };

  it('shows approval and rejection messages and labels the unread count as page-specific', async () => {
    await cargar();
    expect(raiz().textContent).toContain('2 sin leer en esta página');
    expect(raiz().textContent).toContain('Solicitud de reembolso aprobada');
    expect(raiz().textContent).toContain('Solicitud de reembolso rechazada');
    expect(raiz().querySelectorAll('article')).toHaveLength(2);
  });

  it('refreshes from page one when the native disclosure opens', async () => {
    await cargar();
    raiz().querySelector('summary')!.click();
    await vi.waitFor(() => {
      const consultas = http.match((r) => r.url === url && r.params.get('page') === '1');
      expect(consultas).toHaveLength(1);
      consultas[0].flush(PAGINA_NOTIFICACIONES);
    });
    await fixture.whenStable();
    expect(raiz().querySelector('details')!.open).toBe(true);
  });

  it('treats text as text and does not open unknown reference types', async () => {
    http
      .expectOne((r) => r.url === url)
      .flush({
        ...PAGINA_NOTIFICACIONES,
        data: [
          {
            ...NOTIFICACION_APROBADA,
            titulo: '<img src=x onerror=alert(1)>',
            mensaje: '<script>alert(1)</script>',
            referencia_tipo: 'pedido',
          },
        ],
      });
    await fixture.whenStable();
    expect(raiz().textContent).toContain('<img src=x onerror=alert(1)>');
    expect(raiz().querySelector('img, script')).toBeNull();
    expect(raiz().querySelector('[aria-label^="Ver solicitud"]')).toBeNull();
  });

  it('opens the own refund endpoint from its numeric reference and restores focus after closing', async () => {
    await cargar();
    const boton = raiz().querySelector<HTMLButtonElement>(
      '[aria-label="Ver solicitud de la notificación 51"]',
    )!;
    boton.focus();
    boton.click();
    await fixture.whenStable();
    http.expectOne(`${environment.apiUrl}/portal/reembolsos/31`).flush(SOLICITUD_REGISTRADA_PRUEBA);
    await fixture.whenStable();
    expect(raiz().querySelector('dialog')?.textContent).toContain('REF-PRUEBA-001');
    raiz().querySelector<HTMLButtonElement>('[aria-label="Cerrar detalle"]')!.click();
    await fixture.whenStable();
    expect(raiz().querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(boton);
  });

  it('shows an error instead of an empty inbox and supports an explicit retry', async () => {
    http.expectOne((r) => r.url === url).flush({}, { status: 503, statusText: 'Failure' });
    await fixture.whenStable();
    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain('No pudimos consultar');
    raiz().querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    http
      .expectOne((r) => r.url === url)
      .flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    await fixture.whenStable();
    expect(raiz().querySelector('[role="alert"]')).toBeNull();
    expect(raiz().textContent).toContain('Aún no tienes notificaciones');
  });

  it('disables duplicate reading actions, waits for confirmation and announces the result', async () => {
    await cargar();
    const boton = raiz().querySelector<HTMLButtonElement>(
      '[aria-label="Marcar como leída — notificación 51"]',
    )!;
    boton.focus();
    boton.click();
    await fixture.whenStable();
    expect(boton.disabled).toBe(true);
    expect(raiz().querySelector('article')?.textContent).toContain('Sin leer');
    http.expectOne(`${url}/51/leida`).flush({ marcada: true });
    await fixture.whenStable();
    expect(raiz().querySelector('article')?.textContent).toContain('Leída');
    expect(raiz().textContent).toContain('Notificación marcada como leída.');
    expect(document.activeElement?.id).toBe('notificacion-51');
    expect(raiz().textContent).toContain('1 sin leer en esta página');
  });

  it('refreshes on returning to a visible account after 30 seconds, without repeated focus requests', async () => {
    await cargar();
    const ahora = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(ahora + 31_000);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    window.dispatchEvent(new Event('focus'));
    http.expectOne((r) => r.url === url).flush(PAGINA_NOTIFICACIONES);
    window.dispatchEvent(new Event('focus'));
    http.expectNone((r) => r.url === url);
  });

  it('does not refresh in the background or replace an opener while a modal is open', async () => {
    await cargar();
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 31_000);
    const visibilidad = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    http.expectNone((r) => r.url === url);
    visibilidad.mockReturnValue('visible');
    const dialogo = document.createElement('dialog');
    dialogo.open = true;
    document.body.append(dialogo);
    try {
      window.dispatchEvent(new Event('focus'));
      http.expectNone((r) => r.url === url);
    } finally {
      dialogo.remove();
    }
  });
});
