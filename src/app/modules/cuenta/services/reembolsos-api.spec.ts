import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { authTokenInterceptor } from '../../../shared/data-access/interceptors/auth-token.interceptor';
import { PAGINA_SOLICITUDES_PRUEBA, SOLICITUD_REGISTRADA_PRUEBA } from '../testing/reembolsos-data';
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

  it('reads the own paginated portal list with JWT and the optional published state filter', () => {
    const respuesta = vi.fn();
    api.listar(2, 'rechazado').subscribe(respuesta);
    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('estado')).toBe('rechazado');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    req.flush(PAGINA_SOLICITUDES_PRUEBA);
    expect(respuesta).toHaveBeenCalledExactlyOnceWith(PAGINA_SOLICITUDES_PRUEBA);
  });

  it('makes a fresh detail request on every opening instead of retaining the signed evidence link', () => {
    for (const revision of [1, 2]) {
      const respuesta = vi.fn();
      api.detalle(31).subscribe(respuesta);
      const req = http.expectOne(`${url}/31`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
      const detalle = {
        ...SOLICITUD_REGISTRADA_PRUEBA,
        evidencia: {
          nombre: 'prueba.pdf',
          url: `https://example.test/prueba.pdf?revision=${revision}`,
        },
      };
      req.flush(detalle);
      expect(respuesta).toHaveBeenCalledExactlyOnceWith(detalle);
    }
  });

  it.each([
    { ...PAGINA_SOLICITUDES_PRUEBA, meta: null },
    {
      ...PAGINA_SOLICITUDES_PRUEBA,
      data: [{ ...SOLICITUD_REGISTRADA_PRUEBA, estado: 'desconocido' }],
    },
    {
      ...PAGINA_SOLICITUDES_PRUEBA,
      data: [{ ...SOLICITUD_REGISTRADA_PRUEBA, fecha_solicitud: 'incorrecta' }],
    },
  ])('does not interpret malformed list data as a valid empty result', (respuesta) => {
    const next = vi.fn(),
      error = vi.fn();
    api.listar().subscribe({ next, error });
    http.expectOne((r) => r.url === url).flush(respuesta);
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });

  it('rejects a detail that does not correspond to the requested id', () => {
    const next = vi.fn(),
      error = vi.fn();
    api.detalle(99).subscribe({ next, error });
    http.expectOne(`${url}/99`).flush(SOLICITUD_REGISTRADA_PRUEBA);
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });

  it('sends only the four multipart fields with JWT, preserving the file and automatic boundary', () => {
    const respuesta = vi.fn();
    api.solicitar(solicitud).subscribe(respuesta);
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-prueba');
    expect(req.request.headers.has('Content-Type')).toBe(false);
    const datos = req.request.body as FormData;
    expect(req.request.body).toBeInstanceOf(FormData);
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
