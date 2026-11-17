import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { Session } from '../../auth/session';
import { authTokenInterceptor } from './auth-token.interceptor';
import { refreshTokenInterceptor } from './refresh-token.interceptor';

describe('refreshTokenInterceptor', () => {
  const PERFIL = `${environment.apiUrl}/perfil`;
  const REFRESH = `${environment.apiUrl}/auth/refresh`;

  let http: HttpClient;
  let httpMock: HttpTestingController;
  let session: Session;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([refreshTokenInterceptor, authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(Session);
    session.start('jwt-vencido', ['cliente']);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  it('refreshes the expired token and retries the original call with the new one', () => {
    let resultado: unknown;
    http.get(PERFIL).subscribe((r) => (resultado = r));

    const primera = httpMock.expectOne(PERFIL);
    expect(primera.request.headers.get('Authorization')).toBe('Bearer jwt-vencido');
    primera.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refresh = httpMock.expectOne(REFRESH);
    expect(refresh.request.withCredentials).toBe(true);
    refresh.flush({ access_token: 'jwt-nuevo' });

    const reintento = httpMock.expectOne(PERFIL);
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer jwt-nuevo');
    reintento.flush({ nombres: 'Rosa' });

    expect(resultado).toEqual({ nombres: 'Rosa' });
    expect(session.accessToken()).toBe('jwt-nuevo');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('only refreshes once for several calls that expire at the same time', () => {
    http.get(PERFIL).subscribe();
    http.get(`${environment.apiUrl}/portal/pedidos`).subscribe();

    httpMock
      .expectOne(PERFIL)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${environment.apiUrl}/portal/pedidos`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    httpMock.expectOne(REFRESH).flush({ access_token: 'jwt-nuevo' });

    httpMock.expectOne(PERFIL).flush({});
    httpMock.expectOne(`${environment.apiUrl}/portal/pedidos`).flush({});
  });

  it('clears the session and goes to login when the refresh token is also invalid', () => {
    let error: unknown;
    http.get(PERFIL).subscribe({ error: (e: unknown) => (error = e) });

    httpMock
      .expectOne(PERFIL)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(REFRESH)
      .flush(
        { message: 'Refresh token inválido o expirado' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(error).toBeTruthy();
    expect(session.isAuthenticated()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
  });

  it('does not try to refresh a 401 from /auth/refresh or /auth/login themselves', () => {
    let error: unknown;
    http.post(REFRESH, {}).subscribe({ error: (e: unknown) => (error = e) });
    httpMock
      .expectOne(REFRESH)
      .flush(
        { message: 'No se encontró refresh token' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(error).toBeTruthy();
    httpMock.verify();
  });
});
