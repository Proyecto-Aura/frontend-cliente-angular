import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { LoginRequest, SinAccesoAlPortalError } from '../../models/auth.model';

/** HU-B-001: inicio de sesión del portal cliente (hija de auth-layout). */
@Component({
  selector: 'app-auth-login',
  imports: [AuthLoginForm, RouterLink],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-login.html',
})
export class AuthLogin {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  /** HU-B-002 (RF-B10): llega desde el registro con `?registrado=1`. */
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;
  protected readonly recienRegistrado = this.query.get('registrado') === '1';
  /** HU-B-003 (RF-B13): llega tras cambiar la contraseña con `?restablecida=1`. */
  protected readonly contrasenaRestablecida = this.query.get('restablecida') === '1';
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  /** HU-A-005: el backend responde 403 si el correo del cliente no está verificado. */
  protected readonly sinVerificar = signal(false);
  /** Si el cliente entró con su correo, se lleva prellenado a pedir otro enlace. */
  protected readonly emailSugerido = signal<string | null>(null);

  protected onLogin(credentials: LoginRequest): void {
    this.enviando.set(true);
    this.error.set(null);
    this.sinVerificar.set(false);
    this.api.login(credentials).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigate(['/catalogo']);
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        const sinVerificar = err instanceof HttpErrorResponse && err.status === 403;
        this.sinVerificar.set(sinVerificar);
        this.emailSugerido.set(
          sinVerificar && credentials.identificador.includes('@')
            ? credentials.identificador
            : null,
        );
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
