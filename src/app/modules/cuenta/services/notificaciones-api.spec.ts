import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { authTokenInterceptor } from '../../../shared/data-access/interceptors/auth-token.interceptor';
import { NOTIFICACION_APROBADA, PAGINA_NOTIFICACIONES } from '../testing/notificaciones-data';
import { NotificacionesApi } from './notificaciones-api';

describe('NotificacionesApi', () => {
  let api: NotificacionesApi;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/portal/notificaciones`;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(NotificacionesApi);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(Session).start('jwt-prueba', ['cliente']);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('reads the authenticated portal page without relying on an unread filter or sending a user id', () => {
    const next = vi.fn();
    api.listar(2).subscribe(next);
    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().sort()).toEqual(['limit', 'page']);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    req.flush(PAGINA_NOTIFICACIONES);
    expect(next).toHaveBeenCalledExactlyOnceWith(PAGINA_NOTIFICACIONES);
  });

  it.each([
    { ...PAGINA_NOTIFICACIONES, meta: null },
    { ...PAGINA_NOTIFICACIONES, data: [{ ...NOTIFICACION_APROBADA, leido: 'false' }] },
    { ...PAGINA_NOTIFICACIONES, data: [{ ...NOTIFICACION_APROBADA, created_at: 'invalid' }] },
  ])('rejects malformed responses instead of hiding missing notices', (data) => {
    const next = vi.fn(),
      error = vi.fn();
    api.listar().subscribe({ next, error });
    http.expectOne((r) => r.url === url).flush(data);
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });

  it('marks only the requested notification with JWT and requires server confirmation', () => {
    const next = vi.fn();
    api.marcarLeida(51).subscribe(next);
    const req = http.expectOne(`${url}/51/leida`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    req.flush({ marcada: true });
    expect(next).toHaveBeenCalledExactlyOnceWith({ marcada: true });
  });

  it.each([{ marcada: false }, null])(
    'does not confirm a reading from an invalid response',
    (data) => {
      const error = vi.fn();
      api.marcarLeida(51).subscribe({ error });
      http.expectOne(`${url}/51/leida`).flush(data);
      expect(error).toHaveBeenCalledOnce();
    },
  );

  it('never automatically retries the non-idempotent PATCH', () => {
    const error = vi.fn();
    api.marcarLeida(51).subscribe({ error });
    http
      .expectOne(`${url}/51/leida`)
      .flush({}, { status: 404, statusText: 'Not found or already read' });
    expect(error).toHaveBeenCalledOnce();
    http.expectNone(`${url}/51/leida`);
  });
});
