import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PAGINA_NOTIFICACIONES } from '../testing/notificaciones-data';
import { NotificacionesStore } from './notificaciones-store';

describe('NotificacionesStore', () => {
  let store: NotificacionesStore;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/portal/notificaciones`;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificacionesStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(NotificacionesStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));
  const cargar = () => {
    store.cargar();
    http.expectOne((r) => r.url === url).flush(PAGINA_NOTIFICACIONES);
  };

  it('distinguishes an empty inbox from loading and counts only unread notices on the loaded page', () => {
    expect(store.notificaciones()).toBeNull();
    store.cargar();
    expect(store.cargando()).toBe(true);
    http
      .expectOne((r) => r.url === url)
      .flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    expect(store.notificaciones()).toEqual([]);
    expect(store.sinLeerEnPagina()).toBe(0);
    cargar();
    expect(store.sinLeerEnPagina()).toBe(2);
  });

  it('cancels a superseded page and pending reads on destruction', () => {
    store.cargar();
    const anterior = http.expectOne((r) => r.url === url);
    store.cargar(2);
    expect(anterior.cancelled).toBe(true);
    const actual = http.expectOne((r) => r.url === url && r.params.get('page') === '2');
    TestBed.resetTestingModule();
    expect(actual.cancelled).toBe(true);
  });

  it.each([0, 401, 403, 503])(
    'exposes a read failure %s and recovers explicitly without leaking internals',
    (status) => {
      store.cargar();
      http
        .expectOne((r) => r.url === url)
        .flush({ message: 'INTERNAL_SECRET' }, { status, statusText: 'Failure' });
      expect(store.error()).toBeTruthy();
      expect(store.error()).not.toContain('INTERNAL_SECRET');
      expect(store.notificaciones()).toBeNull();
      cargar();
      expect(store.error()).toBeNull();
      expect(store.notificaciones()).toHaveLength(2);
    },
  );

  it('confirms reading once, prevents duplicate PATCH and keeps the notice in the inbox', () => {
    cargar();
    store.marcarLeida(51);
    store.marcarLeida(51);
    store.cargar(2);
    const req = http.expectOne(`${url}/51/leida`);
    http.expectNone((r) => r.url === url);
    expect(store.notificaciones()![0].leido).toBe(false);
    expect(store.ocupada()).toBe(true);
    req.flush({ marcada: true });
    expect(store.notificaciones()![0].leido).toBe(true);
    expect(store.notificaciones()).toHaveLength(2);
    expect(store.sinLeerEnPagina()).toBe(1);
    expect(store.avisoLectura()).toContain('marcada como leída');
    store.marcarLeida(51);
    store.marcarLeida(999);
    http.expectNone((r) => r.method === 'PATCH');
  });

  it.each([0, 404, 503])(
    'does not assume a failed PATCH %s means read and reconciles with a new GET',
    (status) => {
      cargar();
      store.marcarLeida(51);
      http.expectOne(`${url}/51/leida`).flush({}, { status, statusText: 'Failure' });
      expect(store.notificaciones()![0].leido).toBe(false);
      expect(store.erroresLectura()[51]).toBeTruthy();
      store.marcarLeida(51);
      http.expectNone(`${url}/51/leida`);
      store.cargar();
      http
        .expectOne((r) => r.url === url)
        .flush({
          ...PAGINA_NOTIFICACIONES,
          data: PAGINA_NOTIFICACIONES.data.map((n) => ({ ...n, leido: true })),
        });
      expect(store.sinLeerEnPagina()).toBe(0);
      expect(store.erroresLectura()).toEqual({});
    },
  );
});
