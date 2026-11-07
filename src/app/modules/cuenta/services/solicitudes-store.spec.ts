import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PAGINA_SOLICITUDES_PRUEBA, SOLICITUD_REGISTRADA_PRUEBA } from '../testing/reembolsos-data';
import { SolicitudesStore } from './solicitudes-store';

describe('SolicitudesStore', () => {
  let store: SolicitudesStore;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/portal/reembolsos`;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolicitudesStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(SolicitudesStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('distinguishes not loaded, loading, loaded and an empty result without inserting examples', () => {
    expect(store.solicitudes()).toBeNull();
    store.cargar();
    expect(store.cargando()).toBe(true);
    http.expectOne((r) => r.url === url).flush(PAGINA_SOLICITUDES_PRUEBA);
    expect(store.solicitudes()).toEqual(PAGINA_SOLICITUDES_PRUEBA.data);
    expect(store.cargando()).toBe(false);
    store.cargar();
    http
      .expectOne((r) => r.url === url)
      .flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    expect(store.solicitudes()).toEqual([]);
    expect(store.error()).toBeNull();
  });

  it('cancels old page requests so they cannot replace the current result', () => {
    store.cargar();
    const anterior = http.expectOne((r) => r.url === url);
    store.cargar(2);
    expect(anterior.cancelled).toBe(true);
    const req = http.expectOne((r) => r.url === url && r.params.get('page') === '2');
    req.flush({
      ...PAGINA_SOLICITUDES_PRUEBA,
      meta: { total: 11, page: 2, limit: 10, total_pages: 2 },
    });
    expect(store.pagina()).toBe(2);
    expect(store.meta()?.total_pages).toBe(2);
  });

  it.each([401, 403, 503])(
    'exposes a list failure %s and can recover on an explicit retry',
    (status) => {
      store.cargar();
      http
        .expectOne((r) => r.url === url)
        .flush({ message: 'Internal credentials' }, { status, statusText: 'Error' });
      expect(store.error()).not.toBeNull();
      expect(store.error()).not.toContain('credentials');
      expect(store.solicitudes()).toBeNull();
      store.cargar();
      http.expectOne((r) => r.url === url).flush(PAGINA_SOLICITUDES_PRUEBA);
      expect(store.error()).toBeNull();
      expect(store.solicitudes()).toHaveLength(1);
    },
  );

  it('handles unavailable details without retaining previous evidence and can retry', () => {
    store.abrirDetalle(31);
    expect(store.detalleId()).toBe(31);
    expect(store.cargandoDetalle()).toBe(true);
    http.expectOne(`${url}/31`).flush({}, { status: 404, statusText: 'Not found' });
    expect(store.detalle()).toBeNull();
    expect(store.errorDetalle()).toContain('no está disponible');
    store.abrirDetalle(31);
    http.expectOne(`${url}/31`).flush(SOLICITUD_REGISTRADA_PRUEBA);
    expect(store.errorDetalle()).toBeNull();
    expect(store.detalle()?.codigo).toBe('REF-PRUEBA-001');
  });

  it('cancels stale or closed detail requests and reloads them on reopening', () => {
    store.abrirDetalle(31);
    const anterior = http.expectOne(`${url}/31`);
    store.abrirDetalle(32);
    expect(anterior.cancelled).toBe(true);
    const actual = http.expectOne(`${url}/32`);
    store.cerrarDetalle();
    expect(actual.cancelled).toBe(true);
    expect(store.detalleId()).toBeNull();
    expect(store.detalle()).toBeNull();
    store.abrirDetalle(31);
    http.expectOne(`${url}/31`).flush(SOLICITUD_REGISTRADA_PRUEBA);
    expect(store.detalle()?.id).toBe(31);
  });

  it('cancels both pending reads when the page is destroyed', () => {
    store.cargar();
    store.abrirDetalle(31);
    const lista = http.expectOne((r) => r.url === url);
    const detalle = http.expectOne(`${url}/31`);
    TestBed.resetTestingModule();
    expect(lista.cancelled).toBe(true);
    expect(detalle.cancelled).toBe(true);
  });
});
