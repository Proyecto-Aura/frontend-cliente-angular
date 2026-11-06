import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { authTokenInterceptor } from '../../../shared/data-access/interceptors/auth-token.interceptor';
import { SOLICITUD_REGISTRADA_PRUEBA } from '../testing/reembolsos-data';
import { ReembolsosApi } from './reembolsos-api';

describe('ReembolsosApi', () => {
  let http: HttpTestingController;
  let api: ReembolsosApi;
  const url = `${environment.apiUrl}/portal/reembolsos`;
  const archivo = new File(['evidencia de prueba'], 'prueba.pdf', { type: 'application/pdf' });
  const solicitud = {
    pedido_id: 21,
    motivo: ' Otro ',
    descripcion: ' Evidencia exclusiva de pruebas locales. ',
    evidencia: archivo,
  };
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(ReembolsosApi);
    TestBed.inject(Session).start('jwt-prueba', ['cliente']);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sends only the four multipart fields with JWT, preserving the file and automatic boundary', () => {
    const respuesta = vi.fn();
    api.solicitar(solicitud).subscribe(respuesta);
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    expect(req.request.headers.has('Content-Type')).toBe(false);
    const datos = req.request.body as FormData;
    expect([...datos.keys()]).toEqual(['pedido_id', 'motivo', 'descripcion', 'evidencia']);
    expect(datos.get('pedido_id')).toBe('21');
    expect(datos.get('motivo')).toBe('Otro');
    expect(datos.get('descripcion')).toBe('Evidencia exclusiva de pruebas locales.');
    const enviado = datos.get('evidencia') as File;
    expect(enviado.name).toBe('prueba.pdf');
    expect(enviado.type).toBe('application/pdf');
    expect(enviado.size).toBe(archivo.size);
    req.flush(SOLICITUD_REGISTRADA_PRUEBA, { status: 201, statusText: 'Created' });
    expect(respuesta).toHaveBeenCalledExactlyOnceWith(SOLICITUD_REGISTRADA_PRUEBA);
  });

  it.each([
    { pedido: { id: 99, codigo: 'AJENO' } },
    { estado: 'aprobado' },
    { id: 0 },
    { monto: '12' },
  ])('does not announce a saved pending request from an inconsistent response %j', (cambio) => {
    const next = vi.fn(),
      error = vi.fn();
    api.solicitar(solicitud).subscribe({ next, error });
    http.expectOne(url).flush({ ...SOLICITUD_REGISTRADA_PRUEBA, ...cambio });
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });

  it('does not automatically retry a mutation after an HTTP failure', () => {
    const error = vi.fn();
    api.solicitar(solicitud).subscribe({ error });
    http.expectOne(url).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(error).toHaveBeenCalledOnce();
    http.expectNone(url);
  });
});
