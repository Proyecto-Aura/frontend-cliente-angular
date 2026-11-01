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
});
