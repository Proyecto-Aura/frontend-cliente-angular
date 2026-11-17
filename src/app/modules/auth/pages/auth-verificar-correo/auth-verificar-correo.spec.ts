import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../../../environments/environment';
import { routes } from '../../../../app.routes';

describe('AuthVerificarCorreo (HU-A-005)', () => {
  const VERIFY = `${environment.apiUrl}/auth/verify-email`;
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

  afterEach(() => httpMock.verify());

  describe('opened from the link in the email', () => {
    beforeEach(async () => {
      // El enlace del correo apunta a /verify-email: se redirige sin perder el token.
      harness = await RouterTestingHarness.create('/verify-email?token=abc123');
    });

    it('keeps the token and verifies it right away', () => {
      expect(url()).toBe('/auth/verificar-correo?token=abc123');

      const req = httpMock.expectOne(VERIFY);
      expect(req.request.body).toEqual({ token: 'abc123' });
      expect(texto()).toContain('Verificando tu correo');
      req.flush({ message: 'Correo verificado correctamente' });
    });

    it('tells the client the email is verified and links to the login', () => {
      httpMock.expectOne(VERIFY).flush({ message: 'Correo verificado correctamente' });
      harness.detectChanges();

      expect(raiz().querySelector('[role="status"]')?.textContent).toContain('¡Correo verificado!');
      expect(enlaces()).toContain('/auth/login');
      expect(raiz().querySelector('[role="alert"]')).toBeNull();
    });

    it('explains when the link expired or was already used and offers a new one', () => {
      httpMock
        .expectOne(VERIFY)
        .flush(
          { statusCode: 400, message: 'El enlace de verificación es inválido o ha expirado' },
          { status: 400, statusText: 'Bad Request' },
        );
      harness.detectChanges();

      expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
        'El enlace de verificación es inválido o ha expirado',
      );
      expect(enlaces()).toContain('/auth/reenviar-verificacion');
      expect(texto()).not.toContain('¡Correo verificado!');
    });

    it('shows a fallback message when the server cannot be reached', () => {
      httpMock.expectOne(VERIFY).error(new ProgressEvent('error'), { status: 0 });
      harness.detectChanges();

      expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
        'No se pudo conectar con el servidor',
      );
    });
  });

  it('without a token asks for a new link and does not call the backend', async () => {
    harness = await RouterTestingHarness.create('/auth/login');
    await harness.navigateByUrl('/auth/verificar-correo');

    httpMock.expectNone(VERIFY);
    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain('El enlace no es válido');
    expect(enlaces()).toContain('/auth/reenviar-verificacion');
  });
});
