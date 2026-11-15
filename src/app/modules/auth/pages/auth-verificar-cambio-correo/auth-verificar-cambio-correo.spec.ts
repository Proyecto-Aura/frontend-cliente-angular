import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../../../environments/environment';
import { routes } from '../../../../app.routes';
import { Session } from '../../../../shared/auth/session';

describe('AuthVerificarCambioCorreo (HU-B-016, RF-B44)', () => {
  const VERIFICAR = `${environment.apiUrl}/perfil/email/verificar`;
  let harness: RouterTestingHarness;
  let httpMock: HttpTestingController;

  const raiz = () => harness.routeNativeElement!;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const url = () => TestBed.inject(Router).url;
  const enlaces = () => [...raiz().querySelectorAll('a')].map((a) => a.getAttribute('href'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(Session).clear();
  });

  describe('opened from the link in the new email', () => {
    beforeEach(async () => {
      // El enlace del correo apunta a /verificar-cambio-email: se redirige sin perder el token.
      harness = await RouterTestingHarness.create('/verificar-cambio-email?token=abc123');
    });

    it('keeps the token and confirms it right away, only once', () => {
      expect(url()).toBe('/auth/verificar-cambio-correo?token=abc123');

      const req = httpMock.expectOne(VERIFICAR);
      expect(req.request.body).toEqual({ token: 'abc123' });
      expect(texto()).toContain('Confirmando tu nuevo correo');
      req.flush({ message: 'Correo actualizado correctamente' });
      harness.detectChanges();

      httpMock.expectNone(VERIFICAR);
    });

    it('tells the client the email changed and, without a session, links to the login', () => {
      httpMock.expectOne(VERIFICAR).flush({ message: 'Correo actualizado correctamente' });
      harness.detectChanges();

      expect(raiz().querySelector('[role="status"]')?.textContent).toContain(
        '¡Correo actualizado!',
      );
      expect(enlaces()).toContain('/auth/login');
      expect(raiz().querySelector('[role="alert"]')).toBeNull();
    });

    it('explains when the link expired or was already used and sends to Mi perfil', () => {
      httpMock
        .expectOne(VERIFICAR)
        .flush(
          { statusCode: 400, message: 'El enlace no es válido o ya venció' },
          { status: 400, statusText: 'Bad Request' },
        );
      harness.detectChanges();

      expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
        'El enlace no es válido o ya venció',
      );
      expect(enlaces()).toContain('/mi-cuenta/perfil');
      expect(texto()).not.toContain('¡Correo actualizado!');
    });

    it('shows the conflict when another account took the email (409)', () => {
      httpMock
        .expectOne(VERIFICAR)
        .flush(
          { statusCode: 409, message: 'Ese correo ya está registrado en otra cuenta' },
          { status: 409, statusText: 'Conflict' },
        );
      harness.detectChanges();

      expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
        'Ese correo ya está registrado en otra cuenta',
      );
    });
  });

  it('with a session, links back to Mi perfil after confirming', async () => {
    TestBed.inject(Session).start('jwt-de-prueba', ['cliente']);
    harness = await RouterTestingHarness.create('/verificar-cambio-email?token=abc123');

    httpMock.expectOne(VERIFICAR).flush({ message: 'Correo actualizado correctamente' });
    harness.detectChanges();

    expect(enlaces()).toContain('/mi-cuenta/perfil');
    expect(enlaces()).not.toContain('/auth/login');
  });

  it('without a token does not call the backend and asks for a new link', async () => {
    harness = await RouterTestingHarness.create('/auth/verificar-cambio-correo');

    httpMock.expectNone(VERIFICAR);
    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain('El enlace no es válido');
    expect(enlaces()).toContain('/mi-cuenta/perfil');
  });
});
