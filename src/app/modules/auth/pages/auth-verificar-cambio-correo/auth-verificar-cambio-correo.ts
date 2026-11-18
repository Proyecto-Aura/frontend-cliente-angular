import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Alert } from '../../../../shared/ui/alert/alert';
import { Session } from '../../../../shared/auth/session';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { CambioCorreoApi } from '../../services/cambio-correo-api';

type Estado = 'verificando' | 'verificado' | 'fallido';

/**
 * HU-B-016 (RF-B44): la página del enlace que llega al correo nuevo
 * (`/verificar-cambio-email?token=…`). Al abrirse confirma el cambio; hasta
 * entonces la cuenta sigue con el correo anterior.
 */
@Component({
  selector: 'app-auth-verificar-cambio-correo',
  imports: [RouterLink, Alert],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-verificar-cambio-correo.html',
})
export class AuthVerificarCambioCorreo {
  private readonly api = inject(CambioCorreoApi);

  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  /** Con sesión se vuelve a "Mi perfil"; sin ella, al login. */
  protected readonly conSesion = inject(Session).isAuthenticated;
  protected readonly estado = signal<Estado>(this.token ? 'verificando' : 'fallido');
  protected readonly error = signal<string | null>(
    this.token ? null : 'El enlace no es válido. Pide uno nuevo desde Mi perfil.',
  );

  constructor() {
    if (!this.token) return;
    this.api
      .verificar(this.token)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.estado.set('verificado'),
        error: (err: unknown) => {
          this.error.set(
            apiErrorMessage(err, 'No pudimos confirmar tu nuevo correo. Inténtalo de nuevo.'),
          );
          this.estado.set('fallido');
        },
      });
  }
}
