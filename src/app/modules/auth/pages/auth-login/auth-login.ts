import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { LoginRequest, SinAccesoAlPortalError } from '../../models/auth.model';

/** HU-B-001: inicio de sesión del portal cliente (hija de auth-layout). */
@Component({
  selector: 'app-auth-login',
  imports: [AuthLoginForm],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-login.html',
})
export class AuthLogin {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  /** HU-B-002 (RF-B10): llega desde el registro con `?registrado=1`. */
  protected readonly recienRegistrado =
    inject(ActivatedRoute).snapshot.queryParamMap.get('registrado') === '1';
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected onLogin(credentials: LoginRequest): void {
    this.enviando.set(true);
    this.error.set(null);
    this.api.login(credentials).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigate(['/catalogo']);
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.error.set(
          err instanceof SinAccesoAlPortalError
            ? err.message
            : apiErrorMessage(
                err,
                'No pudimos iniciar sesión. Verifica tus datos e inténtalo de nuevo.',
              ),
        );
      },
    });
  }
}
