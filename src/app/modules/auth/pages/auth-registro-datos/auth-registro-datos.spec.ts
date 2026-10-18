import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { authDom } from '../../testing/auth-dom';
import { AuthRegistroDatos } from './auth-registro-datos';

describe('AuthRegistroDatos', () => {
  const REGISTER = `${environment.apiUrl}/auth/register`;
  let httpMock: HttpTestingController;
  let store: AuthRegistroStore;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthRegistroStore,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthRegistroStore);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  const montarYEnviar = () => {
    store.setDocumento({
      tipoDocumento: 'dni',
      tipoCliente: 'persona_natural',
      numeroDocumento: '12345678',
    });
    const fixture = TestBed.createComponent(AuthRegistroDatos);
    fixture.detectChanges();
    const dom = authDom(fixture);
    dom.escribir('Nombres', 'Ana');
    dom.escribir('Apellido paterno', 'Torres');
    dom.escribir('Apellido materno', 'Vega');
    dom.escribir('Teléfono', '987654321');
    dom.escribir('Fecha de nacimiento', '1998-05-12');
    dom.escribir('Dirección', 'Av. Los Girasoles 123');
    dom.clic('Continuar');
    dom.escribir('Email de acceso', 'ana@francos.test');
    dom.escribir('Username', 'anatorres');
    dom.escribir('Contraseña', 'ClaveSegura123');
    dom.clic('Crear cuenta');
    return { fixture, dom };
  };

  it('sends the step 1 document with the data entered', () => {
    montarYEnviar();

    const req = httpMock.expectOne(REGISTER);
    expect(req.request.body).toMatchObject({
      tipo_documento: 'dni',
      numero_documento: '12345678',
      tipo_cliente: 'persona_natural',
      categoria_cliente: 'minorista',
    });
    req.flush({});
  });

  it('goes to the login with the email verification notice (RF-B10)', () => {
    montarYEnviar();
    httpMock.expectOne(REGISTER).flush({
      id: 'u-1',
      email: 'ana@francos.test',
      username: 'anatorres',
      email_verificado: false,
      debe_cambiar_contrasena: false,
    });

    expect(navegar).toHaveBeenCalledWith(['/auth/login'], { queryParams: { registrado: 1 } });
    expect(store.doc()).toBeNull();
  });

  it('shows the API message when the data is rejected (RF-B09)', () => {
    const { fixture, dom } = montarYEnviar();
    httpMock
      .expectOne(REGISTER)
      .flush(
        { statusCode: 409, message: 'Ya existe una cuenta con ese correo electrónico' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(dom.raiz().querySelector('[role="alert"]')?.textContent?.trim()).toBe(
      'Ya existe una cuenta con ese correo electrónico',
    );
    expect(navegar).not.toHaveBeenCalledWith(['/auth/login'], expect.anything());
  });

  it('sends the user back to step 1 when there is no document', () => {
    TestBed.createComponent(AuthRegistroDatos);

    expect(navegar).toHaveBeenCalledWith(['/auth/registro/documento']);
  });
});
