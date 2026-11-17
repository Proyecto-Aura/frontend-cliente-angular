import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { AuthLogin } from './auth-login';

describe('AuthLogin', () => {
  const AUTH = `${environment.apiUrl}/auth`;
  let fixture: ComponentFixture<AuthLogin>;
  let httpMock: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const alerta = () => raiz().querySelector('[role="alert"]')?.textContent?.trim();

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

  afterEach(() => httpMock.verify());

  it('goes to the catalog after a client logs in', () => {
    iniciarSesion();
    httpMock.expectOne(`${AUTH}/login`).flush({
      access_token: 'jwt',
      roles: ['cliente'],
      email_verificado: true,
      debe_cambiar_contrasena: false,
    });
    fixture.detectChanges();

    expect(navegar).toHaveBeenCalledWith(['/catalogo']);
    expect(alerta()).toBeUndefined();
  });

  it('shows "Credenciales inválidas" when the API rejects the credentials (RF-B05)', () => {
    iniciarSesion();
    httpMock
      .expectOne(`${AUTH}/login`)
      .flush(
        { statusCode: 401, message: 'Credenciales inválidas' },
        { status: 401, statusText: 'Unauthorized' },
      );
    fixture.detectChanges();

    expect(alerta()).toBe('Credenciales inválidas');
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

    expect(alerta()).toBe('Credenciales inválidas');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('explains when the server cannot be reached', () => {
    iniciarSesion();
    httpMock.expectOne(`${AUTH}/login`).error(new ProgressEvent('error'), { status: 0 });
    fixture.detectChanges();

    expect(alerta()).toContain('No se pudo conectar con el servidor');
  });

  it('shows no registration notice when arriving normally', () => {
    expect(raiz().querySelector('[role="status"]')).toBeNull();
  });
});

describe('AuthLogin after signing up (HU-B-002, RF-B10)', () => {
  it('tells the client to verify the email before the first login', () => {
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

    const aviso = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');
    expect(aviso?.textContent).toContain('Te enviamos un correo de verificación');
    expect(aviso?.textContent).toContain('antes de tu primer ingreso');
  });

  it('offers to resend the verification email (HU-A-005)', () => {
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

    const enlace = (fixture.nativeElement as HTMLElement).querySelector('[role="status"] a');
    expect(enlace?.textContent).toContain('¿No te llegó? Reenviar');
    expect(enlace?.getAttribute('href')).toBe('/auth/reenviar-verificacion');
  });
});

describe('AuthLogin with an unverified email (HU-A-005)', () => {
  const AUTH = `${environment.apiUrl}/auth`;
  const MENSAJE =
    'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja o solicita un nuevo enlace';
  let fixture: ComponentFixture<AuthLogin>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const alerta = () => raiz().querySelector('[role="alert"]');
  const enlaceReenvio = () => alerta()?.querySelector('a');
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

    expect(alerta()?.textContent).toContain(MENSAJE);
    expect(enlaceReenvio()?.textContent).toContain('Reenviar correo de verificación');
    expect(enlaceReenvio()?.getAttribute('href')).toBe(
      '/auth/reenviar-verificacion?email=rosa@francos.test',
    );
  });

  it('links to the resend page without an email when the client logged in with a username', () => {
    iniciarSesion('rosa');
    rechazar(403, MENSAJE);

    expect(enlaceReenvio()?.getAttribute('href')).toBe('/auth/reenviar-verificacion');
  });

  it('does not offer to resend on wrong credentials (401)', () => {
    iniciarSesion('rosa@francos.test');
    rechazar(401, 'Credenciales inválidas');

    expect(alerta()?.textContent).toContain('Credenciales inválidas');
    expect(enlaceReenvio()).toBeNull();
  });

  it('removes the resend link on the next attempt', () => {
    iniciarSesion('rosa@francos.test');
    rechazar(403, MENSAJE);
    iniciarSesion('rosa@francos.test');
    rechazar(401, 'Credenciales inválidas');

    expect(enlaceReenvio()).toBeNull();
  });
});
