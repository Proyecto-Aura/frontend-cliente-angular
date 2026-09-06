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
  host: { class: 'block w-full max-w-[512px] my-auto' },
  template: `
    <section
      class="flex w-full flex-col gap-8 rounded-[25px] bg-surface px-[30px] py-[50px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)]"
    >
      <div class="flex flex-col gap-2">
        <h1 class="font-display text-[36px] font-extrabold leading-tight tracking-[-0.96px] text-black">
          Iniciar sesión
        </h1>
        <p class="text-[15px] font-medium text-ink-soft">Ingresa tus credenciales para continuar</p>
      </div>

      @if (recienRegistrado) {
        <p class="rounded-lg bg-success-50 px-4 py-3 text-[13px] text-success-700" role="status">
          Cuenta creada. Te enviamos un correo de activación; actívala antes de iniciar sesión.
        </p>
      }

      <app-auth-login-form
        [enviando]="enviando()"
        [error]="error()"
        (submitted)="onLogin($event)"
      />
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
        // TODO: destino real tras login (catálogo del portal cliente).
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
