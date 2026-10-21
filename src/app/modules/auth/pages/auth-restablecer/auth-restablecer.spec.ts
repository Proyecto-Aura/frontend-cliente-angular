import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../../../environments/environment';
import { routes } from '../../../../app.routes';

describe('AuthRestablecer (HU-B-003, RF-B12 y RF-B13)', () => {
  const RESET = `${environment.apiUrl}/auth/reset-password`;
  let harness: RouterTestingHarness;
  let httpMock: HttpTestingController;

  const raiz = () => harness.routeNativeElement!;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const url = () => TestBed.inject(Router).url;
  const escribir = (label: string, valor: string) => {
    const campo = [...raiz().querySelectorAll('label')]
      .find((l) => l.textContent!.includes(label))!
      .querySelector('input')!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    campo.dispatchEvent(new Event('blur'));
  };
  const cambiar = (nueva: string, confirmar: string) => {
    escribir('Nueva contraseña', nueva);
    escribir('Confirmar contraseña', confirmar);
    raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    harness.detectChanges();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    // El enlace del correo apunta a /reset-password: se redirige sin perder el token.
    harness = await RouterTestingHarness.create('/reset-password?token=abc123');
  });

  afterEach(() => httpMock.verify());

  it('opens from the email link keeping the token', () => {
    expect(url()).toBe('/auth/restablecer?token=abc123');
    expect(texto()).toContain('Nueva contraseña');
  });

  it('changes the password and goes back to the login with a message (RF-B13)', async () => {
    cambiar('Clave1234', 'Clave1234');

    const req = httpMock.expectOne(RESET);
    expect(req.request.body).toEqual({
      token: 'abc123',
      nueva_contrasena: 'Clave1234',
      confirmar_contrasena: 'Clave1234',
    });
    req.flush({ message: 'Contraseña restablecida correctamente' });
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(url()).toBe('/auth/login?restablecida=1');
    expect(texto()).toContain('Tu contraseña se cambió correctamente');
  });

  it.each([
    ['Clave1234', 'Clave9999', 'Las contraseñas no coinciden'],
    ['corta', 'corta', 'Debe tener al menos 8 caracteres'],
    ['', '', 'Ingresa tu nueva contraseña'],
  ])('validates "%s" / "%s" before sending (RF-B12)', (nueva, confirmar, mensaje) => {
    cambiar(nueva, confirmar);

    httpMock.expectNone(RESET);
    expect(texto()).toContain(mensaje);
  });

  it('explains when the link expired and offers a new one', () => {
    cambiar('Clave1234', 'Clave1234');
    httpMock
      .expectOne(RESET)
      .flush(
        { message: 'La solicitud no es válida o el enlace expiró' },
        { status: 400, statusText: 'Bad Request' },
      );
    harness.detectChanges();

    const alerta = raiz().querySelector('[role="alert"]')!;
    expect(alerta.textContent).toContain('el enlace expiró');
    expect(alerta.querySelector('a')?.getAttribute('href')).toBe('/auth/recuperar');
  });

  it('without a token asks for a new link', async () => {
    // Se entra desde otra página: con solo cambiar el ?query Angular reusaría el componente.
    await harness.navigateByUrl('/auth/login');
    await harness.navigateByUrl('/auth/restablecer');

    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain('El enlace no es válido');
    expect(raiz().querySelector('form')).toBeNull();
  });
});
