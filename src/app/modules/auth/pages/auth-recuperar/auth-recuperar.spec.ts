import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { AuthRecuperar } from './auth-recuperar';

describe('AuthRecuperar (HU-B-003, RF-B11)', () => {
  const FORGOT = `${environment.apiUrl}/auth/forgot-password`;
  const MENSAJE =
    'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña';
  let fixture: ComponentFixture<AuthRecuperar>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const enviar = (email: string) => {
    const input = raiz().querySelector<HTMLInputElement>('input[type="email"]')!;
    input.value = email;
    input.dispatchEvent(new Event('input'));
    raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AuthRecuperar);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('sends the email and shows the same message whether it exists or not', () => {
    enviar(' rosa@francos.test ');

    const req = httpMock.expectOne(FORGOT);
    expect(req.request.body).toEqual({ email: 'rosa@francos.test' });
    req.flush({ message: MENSAJE });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="status"]')?.textContent).toContain(MENSAJE);
    expect(texto()).toContain('El enlace vence en 1 hora');
    expect(raiz().querySelector('form')).toBeNull();
  });

  it.each([
    ['', 'Ingresa tu correo electrónico'],
    ['no-es-correo', 'Ingresa un correo electrónico válido'],
  ])('validates "%s" before sending', (email, mensaje) => {
    enviar(email);

    httpMock.expectNone(FORGOT);
    expect(texto()).toContain(mensaje);
  });

  it('shows an error if the request fails', () => {
    enviar('rosa@francos.test');
    httpMock.expectOne(FORGOT).flush(null, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos enviar el enlace',
    );
  });

  it('links back to the login', () => {
    const enlaces = [...raiz().querySelectorAll('a')].map((a) => a.getAttribute('href'));

    expect(enlaces).toContain('/auth/login');
  });
});
