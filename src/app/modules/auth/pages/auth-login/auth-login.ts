import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { LoginRequest } from '../../models/auth.model';

/** Página de inicio de sesión del portal cliente (hija de auth-layout). */
@Component({
  selector: 'app-auth-login',
  imports: [AuthLoginForm],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-login.html',
})
export class AuthLogin {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly recienRegistrado =
    this.route.snapshot.queryParamMap.get('registrado') === '1';
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected onLogin(credentials: LoginRequest): void {
    this.enviando.set(true);
    this.error.set(null);
    this.api.login(credentials).subscribe({
      next: () => {
        this.enviando.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // Solo rutas internas: evita que un returnUrl manipulado (ej. "//evil.com") redirija fuera de la app.
        const destino = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/catalogo';
        this.router.navigateByUrl(destino);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(
          apiErrorMessage(err, 'No pudimos iniciar sesión. Verifica tus datos e inténtalo de nuevo.'),
        );
      },
    });
  }
}
