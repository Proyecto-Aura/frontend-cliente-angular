import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { resumenPedido } from '../testing/checkout-data';
import { CheckoutApi } from './checkout-api';

describe('CheckoutApi (HU-B-007)', () => {
  const URL = `${environment.apiUrl}/portal/pedidos/resumen`;
  let api: CheckoutApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CheckoutApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts the cart and the delivery address and returns the summary', () => {
    const pedido = {
      items: [{ producto_presentacion_id: 101, cantidad: 30 }],
      tipo_entrega: 'delivery' as const,
      direccion_entrega: 'Av. Larco 1232',
    };
    const respuesta = resumenPedido({ total: 126, subtotal: 126 });
    let resultado: unknown;

    api.resumir(pedido).subscribe((r) => (resultado = r));
    const req = httpMock.expectOne(URL);
    req.flush(respuesta);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(pedido);
    expect(resultado).toEqual(respuesta);
  });

  it('propagates the backend errors', () => {
    let status = 0;

    api.resumir({ items: [], tipo_entrega: 'delivery' }).subscribe({
      error: (err: { status: number }) => (status = err.status),
    });
    httpMock.expectOne(URL).flush({ message: 'x' }, { status: 400, statusText: 'Bad Request' });

    expect(status).toBe(400);
  });

  describe('consultar (HU-B-013)', () => {
    it('gets the own order by id and returns it with its status', () => {
      const pedido = { id: 7, codigo: 'PED-000007', estado: 'confirmado' };
      let resultado: unknown;

      api.consultar(7).subscribe((r) => (resultado = r));
      const req = httpMock.expectOne(`${environment.apiUrl}/portal/pedidos/7`);
      req.flush(pedido);

      expect(req.request.method).toBe('GET');
      expect(resultado).toEqual(pedido);
    });

    it('propagates a 404 when the order is not the client’s', () => {
      let status = 0;

      api.consultar(9).subscribe({ error: (err: { status: number }) => (status = err.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/portal/pedidos/9`)
        .flush({ message: 'Pedido no encontrado' }, { status: 404, statusText: 'Not Found' });

      expect(status).toBe(404);
    });
  });

  describe('pagar (HU-B-008)', () => {
    const PEDIDOS_URL = `${environment.apiUrl}/portal/pedidos`;
    const pedido = {
      items: [{ producto_presentacion_id: 101, cantidad: 30 }],
      tipo_entrega: 'delivery' as const,
      direccion_entrega: 'Av. Larco 1232',
      culqi_token: 'tkn_sim_ok_tarjeta_abc',
    };

    it('posts the cart with the payment token and returns the paid order', () => {
      const pagado = { id: 7, codigo: 'PED-000007', total: 126 };
      let resultado: unknown;

      api.pagar(pedido).subscribe((r) => (resultado = r));
      const req = httpMock.expectOne(PEDIDOS_URL);
      req.flush(pagado);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(pedido);
      expect(resultado).toEqual(pagado);
    });

    it('propagates a rejected payment (402) so the client can retry', () => {
      let status = 0;
      let mensaje = '';

      api.pagar(pedido).subscribe({
        error: (err: { status: number; error: { message: string } }) => {
          status = err.status;
          mensaje = err.error.message;
        },
      });
      httpMock
        .expectOne(PEDIDOS_URL)
        .flush({ message: 'Tarjeta rechazada' }, { status: 402, statusText: 'Payment Required' });

      expect(status).toBe(402);
      expect(mensaje).toBe('Tarjeta rechazada');
    });
  });
});
