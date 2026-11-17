import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { AuthReenviarVerificacion, ESPERA_REENVIO_SEGUNDOS } from './auth-reenviar-verificacion';

describe('AuthReenviarVerificacion (HU-A-005)', () => {
  const RESEND = `${environment.apiUrl}/auth/resend-verification`;
  const MENSAJE = 'Si el correo está registrado, recibirás un enlace de verificación';
  let fixture: ComponentFixture<AuthReenviarVerificacion>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const boton = () => raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const campo = () => raiz().querySelector<HTMLInputElement>('input[type="email"]')!;
  const escribir = (email: string) => {
    campo().value = email;
    campo().dispatchEvent(new Event('input'));
  };
  const enviar = () => {
    boton().click();
    fixture.detectChanges();
  };

  function crear(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AuthReenviarVerificacion);
    fixture.detectChanges();
  }

  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('sends the trimmed email and shows the generic message', () => {
    crear();
    escribir(' rosa@francos.test ');
    enviar();

    const req = httpMock.expectOne(RESEND);
    expect(req.request.body).toEqual({ email: 'rosa@francos.test' });
    req.flush({ message: MENSAJE });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="status"]')?.textContent).toContain(MENSAJE);
    expect(texto()).toContain('El enlace vence en 24 horas');
  });

  it('prefills the email that comes from the login (?email=)', () => {
    crear({ email: 'rosa@francos.test' });

    expect(campo().value).toBe('rosa@francos.test');
  });

  it.each([
    ['', 'Ingresa tu correo electrónico'],
    ['no-es-correo', 'Ingresa un correo electrónico válido'],
  ])('validates "%s" before sending', (email, mensaje) => {
    crear();
    escribir(email);
    enviar();

    httpMock.expectNone(RESEND);
    expect(texto()).toContain(mensaje);
  });

  it('makes the client wait before asking again, counting down', () => {
    crear();
    escribir('rosa@francos.test');
    enviar();
    httpMock.expectOne(RESEND).flush({ message: MENSAJE });
    fixture.detectChanges();

    expect(boton().disabled).toBe(true);
    expect(boton().textContent).toContain(`Reenviar en ${ESPERA_REENVIO_SEGUNDOS} s`);

    vi.advanceTimersByTime(10_000);
    fixture.detectChanges();
    expect(boton().textContent).toContain(`Reenviar en ${ESPERA_REENVIO_SEGUNDOS - 10} s`);

    vi.advanceTimersByTime((ESPERA_REENVIO_SEGUNDOS - 10) * 1000);
    fixture.detectChanges();
    expect(boton().disabled).toBe(false);
    expect(boton().textContent).toContain('Reenviar enlace');
  });

  it('does not send again while the wait lasts', () => {
    crear();
    escribir('rosa@francos.test');
    enviar();
    httpMock.expectOne(RESEND).flush({ message: MENSAJE });
    fixture.detectChanges();

    enviar();

    httpMock.expectNone(RESEND);
  });

  it('shows an error and lets the client retry right away if the request fails', () => {
    crear();
    escribir('rosa@francos.test');
    enviar();
    httpMock.expectOne(RESEND).flush(null, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos enviar el enlace',
    );
    expect(boton().disabled).toBe(false);
  });

  it('links back to the login', () => {
    crear();
    const enlaces = [...raiz().querySelectorAll('a')].map((a) => a.getAttribute('href'));

    expect(enlaces).toContain('/auth/login');
  });
});
