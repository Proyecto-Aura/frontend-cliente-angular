import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

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
});
