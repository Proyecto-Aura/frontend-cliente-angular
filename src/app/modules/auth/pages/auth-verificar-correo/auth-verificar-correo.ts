import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';

type Estado = 'verificando' | 'verificado' | 'fallido';

/**
 * HU-A-005: la página del enlace del correo de verificación
 * (`/verify-email?token=…`). Al abrirse confirma el correo con el token; si el
 * enlace venció o ya se usó, ofrece pedir uno nuevo.
 */
@Component({
  selector: 'app-auth-verificar-correo',
  imports: [RouterLink],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-verificar-correo.html',
})
export class AuthVerificarCorreo {
  private readonly api = inject(AuthApi);

  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  protected readonly estado = signal<Estado>(this.token ? 'verificando' : 'fallido');
  protected readonly error = signal<string | null>(
    this.token ? null : 'El enlace no es válido. Pide uno nuevo para verificar tu correo.',
  );

  constructor() {
    if (!this.token) return;
    this.api
      .verificarCorreo(this.token)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.estado.set('verificado'),
        error: (err: unknown) => {
          this.error.set(
            apiErrorMessage(err, 'No pudimos verificar tu correo. Inténtalo de nuevo.'),
          );
          this.estado.set('fallido');
        },
      });
  }
}
