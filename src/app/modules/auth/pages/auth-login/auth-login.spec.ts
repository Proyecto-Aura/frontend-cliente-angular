import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { environment } from '../../../../../environments/environment';
import { AuthLogin } from './auth-login';

describe('AuthLogin', () => {
  const AUTH = `${environment.apiUrl}/auth`;
  let fixture: ComponentFixture<AuthLogin>;
  let httpMock: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const aviso = () => TestBed.inject(Avisos).actual();

  const iniciarSesion = () => {
    const escribir = (autocomplete: string, valor: string) => {
      const input = raiz().querySelector<HTMLInputElement>(
        `input[autocomplete="${autocomplete}"]`,
      )!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    };
    escribir('username', 'rosa');
    escribir('current-password', 'Clave123');
    raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(AuthLogin);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('shows a green "Inicio de sesión exitoso" toast and then goes to the catalog', () => {
    vi.useFakeTimers();
    iniciarSesion();
    httpMock.expectOne(`${AUTH}/login`).flush({
      access_token: 'jwt',
      roles: ['cliente'],
      email_verificado: true,
      debe_cambiar_contrasena: false,
    });
    fixture.detectChanges();

    expect(aviso()?.titulo).toBe('Inicio de sesión exitoso');
    expect(aviso()?.tono).toBe('success');
    expect(navegar).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(navegar).toHaveBeenCalledWith(['/catalogo']);
  });

  it('shows "Credenciales inválidas" as a red toast when the API rejects the credentials (RF-B05)', () => {
    iniciarSesion();
    httpMock
      .expectOne(`${AUTH}/login`)
      .flush(
        { statusCode: 401, message: 'Credenciales inválidas' },
        { status: 401, statusText: 'Unauthorized' },
      );
    fixture.detectChanges();

    expect(aviso()?.titulo).toBe('Credenciales inválidas');
    expect(aviso()?.tono).toBe('error');
    expect(aviso()?.enlace).toBeUndefined();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('shows "Credenciales inválidas" to a company user', () => {
    iniciarSesion();
    httpMock.expectOne(`${AUTH}/login`).flush({
      access_token: 'jwt',
      roles: ['ventas'],
      email_verificado: true,
      debe_cambiar_contrasena: false,
    });
    httpMock.expectOne(`${AUTH}/logout`).flush({ message: 'Sesión cerrada' });
    fixture.detectChanges();

    expect(aviso()?.titulo).toBe('Credenciales inválidas');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('explains when the server cannot be reached', () => {
    iniciarSesion();
    httpMock.expectOne(`${AUTH}/login`).error(new ProgressEvent('error'), { status: 0 });
    fixture.detectChanges();

    expect(aviso()?.titulo).toContain('No se pudo conectar con el servidor');
  });

  it('shows no toast when arriving normally', () => {
    expect(aviso()).toBeNull();
  });
});

describe('AuthLogin after signing up (HU-B-002, RF-B10)', () => {
  it('tells the client to verify the email before the first login, with a resend link', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ registrado: '1' }) } },
        },
      ],
    });
    const fixture = TestBed.createComponent(AuthLogin);
    fixture.detectChanges();

    const aviso = TestBed.inject(Avisos).actual();
    expect(aviso?.tono).toBe('success');
    expect(aviso?.detalle).toContain('Te enviamos un correo de verificación');
    expect(aviso?.detalle).toContain('antes de tu primer ingreso');
    expect(aviso?.enlace).toEqual({
      etiqueta: '¿No te llegó? Reenviar',
      ruta: '/auth/reenviar-verificacion',
    });
  });
});

describe('AuthLogin after resetting the password (HU-B-003, RF-B13)', () => {
  it('confirms the change with a green toast', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ restablecida: '1' }) } },
        },
      ],
    });
    const fixture = TestBed.createComponent(AuthLogin);
    fixture.detectChanges();

    const aviso = TestBed.inject(Avisos).actual();
    expect(aviso?.titulo).toBe('Tu contraseña se cambió correctamente');
    expect(aviso?.tono).toBe('success');
  });
});

describe('AuthLogin with an unverified email (HU-A-005)', () => {
  const AUTH = `${environment.apiUrl}/auth`;
  const MENSAJE =
    'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja o solicita un nuevo enlace';
  let fixture: ComponentFixture<AuthLogin>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const aviso = () => TestBed.inject(Avisos).actual();
  const iniciarSesion = (identificador: string) => {
    const escribir = (autocomplete: string, valor: string) => {
      const input = raiz().querySelector<HTMLInputElement>(
        `input[autocomplete="${autocomplete}"]`,
      )!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    };
    escribir('username', identificador);
    escribir('current-password', 'Clave123');
    raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };
  const rechazar = (status: number, message: string) => {
    httpMock
      .expectOne(`${AUTH}/login`)
      .flush({ statusCode: status, message }, { status, statusText: 'Error' });
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(AuthLogin);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('shows the backend message and a resend link carrying the email the client typed', () => {
    iniciarSesion('rosa@francos.test');
    rechazar(403, MENSAJE);

    expect(aviso()?.titulo).toBe(MENSAJE);
    expect(aviso()?.enlace).toEqual({
      etiqueta: 'Reenviar correo de verificación',
      ruta: '/auth/reenviar-verificacion',
      queryParams: { email: 'rosa@francos.test' },
    });
  });

  it('links to the resend page without an email when the client logged in with a username', () => {
    iniciarSesion('rosa');
    rechazar(403, MENSAJE);

    expect(aviso()?.enlace).toEqual({
      etiqueta: 'Reenviar correo de verificación',
      ruta: '/auth/reenviar-verificacion',
    });
  });

  it('does not offer to resend on wrong credentials (401)', () => {
    iniciarSesion('rosa@francos.test');
    rechazar(401, 'Credenciales inválidas');

    expect(aviso()?.titulo).toBe('Credenciales inválidas');
    expect(aviso()?.enlace).toBeUndefined();
  });

  it('removes the resend link on the next attempt', () => {
    iniciarSesion('rosa@francos.test');
    rechazar(403, MENSAJE);
    iniciarSesion('rosa@francos.test');
    rechazar(401, 'Credenciales inválidas');

    expect(aviso()?.enlace).toBeUndefined();
  });
});
