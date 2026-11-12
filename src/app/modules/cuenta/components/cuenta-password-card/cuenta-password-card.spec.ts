import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { CuentaPasswordCard } from './cuenta-password-card';

describe('CuentaPasswordCard (HU-B-017, RF-B45)', () => {
  const URL = `${environment.apiUrl}/auth/cambiar-contrasena`;
  let fixture: ComponentFixture<CuentaPasswordCard>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const campo = (id: string) => raiz().querySelector<HTMLInputElement>(`#${id}`)!;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const boton = () => raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const escribir = (id: string, valor: string) => {
    const input = campo(id);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const enviar = () => {
    boton().click();
    fixture.detectChanges();
  };
  const llenar = (actual = 'Actual1234', nueva = 'Nueva1234', confirmar = nueva) => {
    escribir('pw-actual', actual);
    escribir('pw-nueva', nueva);
    escribir('pw-confirmar', confirmar);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CuentaPasswordCard);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('asks for the current password, the new one and its confirmation, hidden by default', () => {
    expect(texto()).toContain('Cambiar contraseña');
    expect(raiz().querySelector('label[for="pw-actual"]')!.textContent).toContain(
      'Contraseña actual',
    );
    expect(campo('pw-actual').type).toBe('password');
    expect(campo('pw-nueva').type).toBe('password');
    expect(campo('pw-confirmar').type).toBe('password');
    expect(campo('pw-actual').autocomplete).toBe('current-password');
  });

  it('shows the passwords when the client asks for it', () => {
    raiz().querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    fixture.detectChanges();

    expect(campo('pw-actual').type).toBe('text');
    expect(campo('pw-confirmar').type).toBe('text');
  });

  it('does not call the server with empty fields and says what is missing', () => {
    enviar();

    expect(texto()).toContain('Ingresa tu contraseña actual');
    expect(texto()).toContain('Ingresa tu nueva contraseña');
    expect(texto()).toContain('Confirma tu nueva contraseña');
    expect(campo('pw-actual').getAttribute('aria-invalid')).toBe('true');
    httpMock.expectNone(URL);
  });

  it('checks the minimum length, the confirmation and that the new one is different', () => {
    llenar('Actual1234', 'Corta1', 'Otra1');
    enviar();
    expect(texto()).toContain('Debe tener al menos 8 caracteres');
    expect(texto()).toContain('Las contraseñas no coinciden');

    llenar('Actual1234', 'Actual1234');
    enviar();
    expect(texto()).toContain('Debe ser distinta de tu contraseña actual');
    httpMock.expectNone(URL);
  });

  it('sends the passwords, clears the form and confirms the change', () => {
    llenar();
    enviar();

    const req = httpMock.expectOne(URL);
    expect(req.request.body).toEqual({
      contrasena_actual: 'Actual1234',
      nueva_contrasena: 'Nueva1234',
      confirmar_contrasena: 'Nueva1234',
    });
    expect(boton().textContent).toContain('Guardando…');
    req.flush({ message: 'Contraseña actualizada' });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="status"]')!.textContent).toContain(
      'Tu contraseña se actualizó.',
    );
    expect(campo('pw-actual').value).toBe('');
    expect(campo('pw-nueva').value).toBe('');
  });

  it('does not send twice while the server is answering', () => {
    llenar();
    enviar();
    enviar();

    httpMock.expectOne(URL).flush({ message: 'Contraseña actualizada' });
  });

  it('marks the current password when the server says it is wrong, and clears it when edited', () => {
    llenar('Equivocada1');
    enviar();
    httpMock
      .expectOne(URL)
      .flush(
        { message: 'La contraseña actual no es correcta' },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();

    expect(raiz().querySelector('#pw-actual-error')!.textContent).toContain(
      'La contraseña actual no es correcta',
    );
    expect(raiz().querySelector('[role="alert"]')).toBeNull();

    escribir('pw-actual', 'Actual1234');
    expect(raiz().querySelector('#pw-actual-error')).toBeNull();
  });

  it('shows other server errors in the form', () => {
    llenar();
    enviar();
    httpMock
      .expectOne(URL)
      .flush({ message: 'Error interno' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="alert"]')!.textContent).toContain('Error interno');
    expect(boton().textContent).toContain('Cambiar contraseña');
  });
});
