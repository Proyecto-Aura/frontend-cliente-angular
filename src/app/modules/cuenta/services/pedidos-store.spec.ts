import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PEDIDO_DETALLE_PRUEBA, PEDIDO_RESUMEN_PRUEBA } from '../testing/pedidos-data';
import { PedidosStore } from './pedidos-store';

describe('PedidosStore', () => {
  let store: PedidosStore;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/portal/pedidos`;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidosStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(PedidosStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));

  const responderLista = (page = 1) =>
    http
      .expectOne((r) => r.url === url && r.params.get('page') === String(page))
      .flush({
        data: [PEDIDO_RESUMEN_PRUEBA],
        meta: { page, limit: 10, total: 11, total_pages: 2 },
      });

  it('verifies details before offering an order and uses the paid amount instead of the summary total', () => {
    store.cargar();
    responderLista();
    expect(store.hayElegibles()).toBe(false);
    expect(store.cargando()).toBe(true);
    http
      .expectOne(`${url}/21`)
      .flush({ ...PEDIDO_DETALLE_PRUEBA, pago: { ...PEDIDO_DETALLE_PRUEBA.pago, monto: 9 } });
    expect(store.opciones()[0].montoPagado).toBe(9);
    expect(store.hayElegibles()).toBe(true);
    expect(store.meta()?.total_pages).toBe(2);
    expect(store.cargando()).toBe(false);
  });

  it('does not infer a payment from the summary payment method when detail has no payment', () => {
    store.cargar();
    responderLista();
    http.expectOne(`${url}/21`).flush({ ...PEDIDO_DETALLE_PRUEBA, pago: null });
    expect(store.opciones()[0].pagado).toBe(false);
    expect(store.hayElegibles()).toBe(false);
  });

  it('keeps a failed detail unavailable and recovers on retry', () => {
    store.cargar();
    responderLista();
    http.expectOne(`${url}/21`).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(store.detalleIncompleto()).toBe(true);
    expect(store.filas()).toHaveLength(1);
    expect(store.opciones()).toHaveLength(0);
    store.cargar();
    responderLista();
    http.expectOne(`${url}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    expect(store.detalleIncompleto()).toBe(false);
    expect(store.hayElegibles()).toBe(true);
  });

  it('distinguishes an empty response from a session error', () => {
    store.cargar();
    http
      .expectOne((r) => r.url === url)
      .flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    expect(store.error()).toBeNull();
    expect(store.filas()).toEqual([]);
    expect(store.cargando()).toBe(false);
    store.cargar();
    http.expectOne((r) => r.url === url).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(store.error()).toContain('sesión ha vencido');
    expect(store.hayElegibles()).toBe(false);
  });

  it('cancels the previous page and does not retain its orders on navigation or destruction', () => {
    store.cargar();
    const anterior = http.expectOne((r) => r.url === url);
    store.cargar(2);
    expect(anterior.cancelled).toBe(true);
    responderLista(2);
    const detalle = http.expectOne(`${url}/21`);
    TestBed.resetTestingModule();
    expect(detalle.cancelled).toBe(true);
  });
});
