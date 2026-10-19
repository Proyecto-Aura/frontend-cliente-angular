import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LoginRequest } from '../../models/auth.model';
import { AuthLoginForm } from './auth-login-form';

describe('AuthLoginForm', () => {
  let fixture: ComponentFixture<AuthLoginForm>;
  let enviados: LoginRequest[];

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent ?? '';
  const campo = (autocomplete: string) =>
    raiz().querySelector<HTMLInputElement>(`input[autocomplete="${autocomplete}"]`)!;
  const escribir = (autocomplete: string, valor: string) => {
    const input = campo(autocomplete);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  };
  const enviar = () => {
    raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(AuthLoginForm);
    enviados = [];
    fixture.componentInstance.submitted.subscribe((c) => enviados.push(c));
    fixture.detectChanges();
  });

  it('shows a message for each empty field and does not submit (RF-B05)', () => {
    enviar();

    expect(texto()).toContain('Ingresa tu correo o nombre de usuario');
    expect(texto()).toContain('Ingresa tu contraseña');
    expect(enviados).toEqual([]);
  });

  it('treats a username of only spaces as empty', () => {
    escribir('username', '   ');
    escribir('current-password', 'Clave123');
    enviar();

    expect(texto()).toContain('Ingresa tu correo o nombre de usuario');
    expect(enviados).toEqual([]);
  });

  it('submits the trimmed username, the password and "recordar"', () => {
    escribir('username', '  rosa@francos.pe ');
    escribir('current-password', 'Clave123');
    raiz().querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    enviar();

    expect(enviados).toEqual([
      { identificador: 'rosa@francos.pe', password: 'Clave123', recordar: true },
    ]);
  });

  it('shows and hides the password with the eye icon (RF-B02)', () => {
    const ojo = raiz().querySelector<HTMLButtonElement>('button[aria-label="Mostrar contraseña"]')!;
    ojo.click();
    fixture.detectChanges();

    expect(campo('current-password').type).toBe('text');
    expect(raiz().querySelector('button[aria-label="Ocultar contraseña"]')).not.toBeNull();
  });

  it('links to password recovery and sign up (RF-B03, RF-B04)', () => {
    const enlaces = Array.from(raiz().querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(enlaces).toEqual(expect.arrayContaining(['/auth/recuperar', '/auth/registro']));
  });

  it('shows the API error and disables the button while sending', () => {
    fixture.componentRef.setInput('error', 'Credenciales inválidas');
    fixture.componentRef.setInput('enviando', true);
    fixture.detectChanges();

    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain('Credenciales inválidas');
    const boton = raiz().querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(boton.disabled).toBe(true);
    expect(boton.textContent).toContain('Ingresando');
  });
});
