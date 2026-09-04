import { Component } from '@angular/core';

import {
  AuthLoginForm,
  LoginCredentials,
} from '../../components/auth-login-form/auth-login-form';

/** Página de inicio de sesión (hija de auth-layout). */
@Component({
  selector: 'app-auth-login',
  imports: [AuthLoginForm],
  host: { class: 'block w-full max-w-[564px]' },
  template: `
    <section
      class="w-full rounded-3xl bg-surface p-10 shadow-[0_30px_80px_-24px_rgba(17,24,39,0.22)] sm:px-14 sm:py-14"
    >
      <h2 class="text-[36px] font-extrabold leading-tight tracking-tight text-ink">Iniciar sesión</h2>
      <p class="mt-2 text-[15px] text-ink-soft">Ingresa tus credenciales para continuar</p>

      <div class="mt-10">
        <app-auth-login-form (submitted)="onLogin($event)" />
      </div>
    </section>
  `,
})
export class AuthLogin {
  protected onLogin(credentials: LoginCredentials): void {
    // TODO: llamar a AuthService y redirigir cuando el backend esté listo.
    console.log('login', credentials);
  }
}
