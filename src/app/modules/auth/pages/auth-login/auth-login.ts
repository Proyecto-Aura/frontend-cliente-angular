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
  templateUrl: './auth-login.html',
})
export class AuthLogin {
  protected onLogin(credentials: LoginCredentials): void {
    // TODO: llamar a AuthService y redirigir cuando el backend esté listo.
    console.log('login', credentials);
  }
}
