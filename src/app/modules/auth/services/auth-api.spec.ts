import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { LoginResponse, SinAccesoAlPortalError } from '../models/auth.model';
import { AuthApi } from './auth-api';

describe('AuthApi', () => {
  const AUTH = `${environment.apiUrl}/auth`;
  let api: AuthApi;
  let session: Session;
  let httpMock: HttpTestingController;

  const respuesta = (roles: string[]): LoginResponse => ({
    access_token: 'jwt',
    roles,
    email_verificado: true,
    debe_cambiar_contrasena: false,
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AuthApi);
    session = TestBed.inject(Session);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('logs a client in, sending "recordar" and the refresh cookie', () => {
    api.login({ identificador: 'rosa', password: 'Clave123', recordar: true }).subscribe();

    const req = httpMock.expectOne(`${AUTH}/login`);
    expect(req.request.body).toEqual({
      identificador: 'rosa',
      password: 'Clave123',
      recordar: true,
    });
    expect(req.request.withCredentials).toBe(true);
    req.flush(respuesta(['cliente']));

    expect(session.isAuthenticated()).toBe(true);
    expect(session.roles()).toEqual(['cliente']);
  });

  it('rejects a user without the cliente role and closes the session the API opened', () => {
    let error: unknown;
    api
      .login({ identificador: 'vendedor', password: 'Clave123', recordar: false })
      .subscribe({ error: (e: unknown) => (error = e) });

    httpMock.expectOne(`${AUTH}/login`).flush(respuesta(['ventas']));
    const logout = httpMock.expectOne(`${AUTH}/logout`);
    expect(logout.request.withCredentials).toBe(true);
    logout.flush({ message: 'Sesión cerrada' });

    expect(error).toBeInstanceOf(SinAccesoAlPortalError);
    expect((error as Error).message).toBe('Credenciales inválidas');
    expect(session.isAuthenticated()).toBe(false);
  });

  it('still rejects the user when closing that session fails', () => {
    let error: unknown;
    api
      .login({ identificador: 'admin', password: 'Clave123', recordar: false })
      .subscribe({ error: (e: unknown) => (error = e) });

    httpMock.expectOne(`${AUTH}/login`).flush(respuesta(['admin']));
    httpMock.expectOne(`${AUTH}/logout`).flush(null, { status: 500, statusText: 'Error' });

    expect(error).toBeInstanceOf(SinAccesoAlPortalError);
    expect(session.isAuthenticated()).toBe(false);
  });

  it('logs out: the API revokes the session and the local session is cleared (HU-B-004)', () => {
    session.start('jwt', ['cliente']);
    let terminado = false;
    api.cerrarSesion().subscribe(() => (terminado = true));

    const req = httpMock.expectOne(`${AUTH}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ message: 'Sesión cerrada' });

    expect(terminado).toBe(true);
    expect(session.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('francos.access_token')).toBeNull();
  });

  it('clears the local session even if the logout call fails', () => {
    session.start('jwt', ['cliente']);
    let terminado = false;
    api.cerrarSesion().subscribe(() => (terminado = true));

    httpMock.expectOne(`${AUTH}/logout`).flush(null, { status: 500, statusText: 'Error' });

    expect(terminado).toBe(true);
    expect(session.isAuthenticated()).toBe(false);
  });

  it('asks for the password recovery link (HU-B-003)', () => {
    let mensaje = '';
    api.solicitarRecuperacion('rosa@francos.test').subscribe((r) => (mensaje = r.message));

    const req = httpMock.expectOne(`${AUTH}/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'rosa@francos.test' });
    req.flush({ message: 'Si el correo está registrado, recibirás un enlace' });

    expect(mensaje).toContain('Si el correo está registrado');
  });

  it('sets the new password with the token of the link (HU-B-003)', () => {
    const body = {
      token: 'abc123',
      nueva_contrasena: 'Clave1234',
      confirmar_contrasena: 'Clave1234',
    };
    api.restablecerContrasena(body).subscribe();

    const req = httpMock.expectOne(`${AUTH}/reset-password`);
    expect(req.request.body).toEqual(body);
    req.flush({ message: 'Contraseña restablecida correctamente' });
  });

  it('registers a client without starting a session (HU-B-002)', () => {
    api
      .registrarCliente({
        nombres: 'Ana',
        apellido_paterno: 'Torres',
        apellido_materno: 'Vega',
        tipo_documento: 'dni',
        numero_documento: '12345678',
        tipo_cliente: 'persona_natural',
        categoria_cliente: 'minorista',
        email: 'ana@francos.test',
        username: 'anatorres',
        password: 'Clave1234',
      })
      .subscribe();

    const req = httpMock.expectOne(`${AUTH}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ numero_documento: '12345678' });
    req.flush({ id: 'u-1', email_verificado: false });

    expect(session.isAuthenticated()).toBe(false);
  });

  it('passes the API error through when the credentials are wrong', () => {
    let status: number | undefined;
    api
      .login({ identificador: 'rosa', password: 'mala', recordar: false })
      .subscribe({ error: (e: { status: number }) => (status = e.status) });

    httpMock
      .expectOne(`${AUTH}/login`)
      .flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(status).toBe(401);
    expect(session.isAuthenticated()).toBe(false);
  });
});
