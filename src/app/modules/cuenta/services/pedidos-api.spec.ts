import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { authTokenInterceptor } from '../../../shared/data-access/interceptors/auth-token.interceptor';
import { Session } from '../../../shared/auth/session';
import { PedidosApi } from './pedidos-api';

describe('PedidosApi', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('uses only portal endpoints, JWT and server pagination', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    TestBed.inject(Session).start('jwt-prueba', ['cliente']);
    const api = TestBed.inject(PedidosApi);
    const http = TestBed.inject(HttpTestingController);
    api.listar(2).subscribe();
    const lista = http.expectOne((r) => r.url === `${environment.apiUrl}/portal/pedidos`);
    expect(lista.request.method).toBe('GET');
    expect(lista.request.params.get('page')).toBe('2');
    expect(lista.request.params.get('limit')).toBe('10');
    expect(lista.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    lista.flush({ data: [], meta: { page: 2, limit: 10, total: 0, total_pages: 0 } });
    api.detalle(21).subscribe();
    const detalle = http.expectOne(`${environment.apiUrl}/portal/pedidos/21`);
    expect(detalle.request.method).toBe('GET');
    expect(detalle.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    detalle.flush({});
  });
});
