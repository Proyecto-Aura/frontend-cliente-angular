import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { LoginRequest } from '../../models/auth.model';

/** Página de inicio de sesión (hija de auth-layout). */
@Component({
  selector: 'app-auth-login',
  imports: [AuthLoginForm],
  host: { class: 'block w-full max-w-[564px] my-auto' },
  template: `
    <section
      class="w-full rounded-3xl bg-surface p-10 shadow-[0_30px_80px_-24px_rgba(17,24,39,0.22)] sm:px-14 sm:py-16"
    >
      <h2 class="text-[36px] font-extrabold leading-tight tracking-tight text-ink">Iniciar sesión</h2>
      <p class="mt-2 text-[15px] text-ink-soft">Ingresa tus credenciales para continuar</p>

      @if (recienRegistrado) {
        <p class="mt-6 rounded-[10px] bg-success-50 px-4 py-3 text-sm text-success-600" role="status">
          Cuenta creada. Te enviamos un correo para verificarla; ya puedes iniciar sesión.
        </p>
      }

      <div class="mt-10">
        <app-auth-login-form
          [enviando]="enviando()"
          [error]="error()"
          (submitted)="onLogin($event)"
        />
      </div>
    </section>
  `,
})
export class AuthLogin {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

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
        // TODO: destino real tras login (catálogo / mi-cuenta).
        this.router.navigate(['/catalogo']);
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
