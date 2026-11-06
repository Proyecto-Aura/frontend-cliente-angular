import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import {
  PAGINA_NOTIFICACIONES,
  NOTIFICACION_APROBADA,
  NOTIFICACION_RECHAZADA,
} from '../../testing/notificaciones-data';
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
  const cargar = async (pagina = PAGINA_NOTIFICACIONES) => {
    http.expectOne((r) => r.url === url).flush(pagina);
    await fixture.whenStable();
  };
  const abrirAvisos = async (pagina = PAGINA_NOTIFICACIONES) => {
    raiz().querySelector('summary')!.click();
    await vi.waitFor(() => {
      const consultas = http.match((r) => r.url === url && r.params.get('page') === '1');
      expect(consultas).toHaveLength(1);
      consultas[0].flush(pagina);
    });
    await fixture.whenStable();
  };

  it('shows approval and rejection messages and labels the unread count as page-specific', async () => {
    await cargar();
    expect(raiz().textContent).toContain('2 sin leer en esta página');
    expect(raiz().textContent).toContain('Solicitud de reembolso aprobada');
    expect(raiz().textContent).toContain('Solicitud de reembolso rechazada');
    expect(raiz().querySelectorAll('article')).toHaveLength(2);
    for (const aviso of [NOTIFICACION_APROBADA, NOTIFICACION_RECHAZADA]) {
      const tarjeta = raiz().querySelector<HTMLElement>(
        `article[aria-labelledby="notificacion-${aviso.id}"]`,
      )!;
      expect(tarjeta.querySelector('h2')?.textContent?.trim()).toBe(aviso.titulo);
      expect(tarjeta.querySelector('p')?.textContent?.trim()).toBe(aviso.mensaje);
      expect(tarjeta.querySelector('time')?.getAttribute('datetime')).toBe(aviso.created_at);
    }
  });

  it('refreshes from page one when the native disclosure opens', async () => {
    await cargar();
    await abrirAvisos();
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

  it.each([
    {
      aviso: NOTIFICACION_APROBADA,
      id: 31,
      codigo: 'REF-PRUEBA-001',
      estado: 'aprobado',
      etiqueta: 'Aprobado',
      motivoRechazo: null,
    },
    {
      aviso: NOTIFICACION_RECHAZADA,
      id: 32,
      codigo: 'REF-PRUEBA-002',
      estado: 'rechazado',
      etiqueta: 'Rechazado',
      motivoRechazo: 'Evidencia no legible.',
    },
  ] as const)(
    'RF-B42: el aviso $estado abre su reembolso correcto y devuelve el foco al cerrar',
    async ({ aviso, id, codigo, estado, etiqueta, motivoRechazo }) => {
      await cargar();
      await abrirAvisos();
      const boton = raiz().querySelector<HTMLButtonElement>(
        `[aria-label="Ver solicitud de la notificación ${aviso.id}"]`,
      )!;
      boton.focus();
      boton.click();
      await fixture.whenStable();
      const consulta = http.expectOne(`${environment.apiUrl}/portal/reembolsos/${id}`);
      expect(consulta.request.method).toBe('GET');
      consulta.flush({
        ...SOLICITUD_REGISTRADA_PRUEBA,
        id,
        codigo,
        estado,
        pedido: { id: id - 10, codigo: `PED-PRUEBA-${id - 10}` },
        fecha_resolucion: '2026-11-06T13:00:00Z',
        motivo_rechazo: motivoRechazo,
      });
      await fixture.whenStable();
      const modal = raiz().querySelector('dialog')!;
      expect(modal.querySelector('h2')?.textContent?.trim()).toBe(`Solicitud ${codigo}`);
      expect(modal.querySelector('app-cuenta-solicitud-estado')?.textContent?.trim()).toBe(
        etiqueta,
      );
      expect(modal.textContent).toContain(`PED-PRUEBA-${id - 10}`);
      if (motivoRechazo) expect(modal.textContent).toContain(motivoRechazo);
      http.expectNone((r) => r.method === 'PATCH' || r.method === 'POST');
      raiz().querySelector<HTMLButtonElement>('[aria-label="Cerrar detalle"]')!.click();
      await fixture.whenStable();
      expect(raiz().querySelector('dialog')).toBeNull();
      expect(document.activeElement).toBe(boton);
    },
  );

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

  it.each([NOTIFICACION_APROBADA, NOTIFICACION_RECHAZADA])(
    'RF-B42: actualiza una bandeja vacía con $tipo al recuperar el foco',
    async (aviso) => {
      const vacia = { data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } };
      await cargar(vacia);
      await abrirAvisos(vacia);
      expect(raiz().textContent).toContain('Aún no tienes notificaciones.');
      expect(raiz().querySelectorAll('article')).toHaveLength(0);
      const ahora = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(ahora + 31_000);
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
      window.dispatchEvent(new Event('focus'));
      http
        .expectOne((r) => r.url === url)
        .flush({ data: [aviso], meta: { total: 1, page: 1, limit: 10, total_pages: 1 } });
      await fixture.whenStable();
      expect(raiz().querySelectorAll('article')).toHaveLength(1);
      expect(raiz().querySelector('article h2')?.textContent?.trim()).toBe(aviso.titulo);
      expect(raiz().querySelector('article p')?.textContent?.trim()).toBe(aviso.mensaje);
      expect(raiz().querySelector('summary')?.textContent).toContain('1 sin leer en esta página');
      expect(raiz().textContent).not.toContain('Aún no tienes notificaciones.');
      window.dispatchEvent(new Event('focus'));
      http.expectNone((r) => r.url === url);
    },
  );

  it('RF-B42: los botones de paginación consultan la página elegida y sustituyen los avisos anteriores', async () => {
    const datos = Array.from({ length: 11 }, (_, indice) => ({
      ...NOTIFICACION_APROBADA,
      id: 101 + indice,
      titulo: `Aviso de prueba ${101 + indice}`,
      mensaje: `Mensaje del aviso ${101 + indice}`,
    }));
    const primera = {
      data: datos.slice(0, 10),
      meta: { total: 11, page: 1, limit: 10, total_pages: 2 },
    };
    await cargar(primera);
    await abrirAvisos(primera);
    const nav = () =>
      raiz().querySelector<HTMLElement>('nav[aria-label="Páginas de notificaciones"]')!;
    expect(raiz().querySelectorAll('article')).toHaveLength(10);
    expect(nav().textContent).toContain('Página 1 de 2');
    expect(nav().querySelectorAll('button')[0].disabled).toBe(true);
    nav().querySelectorAll('button')[1].click();
    const segunda = http.expectOne(
      (r) => r.url === url && r.params.get('page') === '2' && r.params.get('limit') === '10',
    );
    expect(segunda.request.method).toBe('GET');
    await fixture.whenStable();
    expect(nav().querySelectorAll('button')[0].disabled).toBe(true);
    expect(nav().querySelectorAll('button')[1].disabled).toBe(true);
    segunda.flush({
      data: datos.slice(10),
      meta: { total: 11, page: 2, limit: 10, total_pages: 2 },
    });
    await fixture.whenStable();
    expect(nav().textContent).toContain('Página 2 de 2');
    expect(raiz().querySelectorAll('article')).toHaveLength(1);
    expect(raiz().querySelector('article h2')?.textContent?.trim()).toBe('Aviso de prueba 111');
    expect(raiz().querySelector('article p')?.textContent?.trim()).toBe('Mensaje del aviso 111');
    expect(nav().querySelectorAll('button')[1].disabled).toBe(true);
    expect(nav().querySelectorAll('button')[0].disabled).toBe(false);
    nav().querySelectorAll('button')[0].click();
    http.expectOne((r) => r.url === url && r.params.get('page') === '1').flush(primera);
    await fixture.whenStable();
    expect(nav().textContent).toContain('Página 1 de 2');
    expect(raiz().querySelectorAll('article')).toHaveLength(10);
    expect(raiz().querySelector('[id="notificacion-111"]')).toBeNull();
    http.expectNone((r) => r.method === 'POST' || r.method === 'PATCH');
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
