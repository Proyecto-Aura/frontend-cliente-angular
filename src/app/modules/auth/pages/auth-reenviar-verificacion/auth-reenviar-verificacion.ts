import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthInput } from '../../components/auth-input/auth-input';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';

/** El backend no envía otro correo al mismo email si se pidió hace menos de esto. */
export const ESPERA_REENVIO_SEGUNDOS = 60;

/**
 * HU-A-005: el cliente pide un enlace de verificación nuevo. Pide el correo (no
 * el usuario), que puede llegar prellenado desde el login con `?email=`. Tras
 * enviar, el botón espera `ESPERA_REENVIO_SEGUNDOS` antes de dejar reenviar.
 */
@Component({
  selector: 'app-auth-reenviar-verificacion',
  imports: [ReactiveFormsModule, RouterLink, AuthInput],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-reenviar-verificacion.html',
})
export class AuthReenviarVerificacion {
  private readonly api = inject(AuthApi);

  protected readonly form = new FormGroup({
    email: new FormControl(inject(ActivatedRoute).snapshot.queryParamMap.get('email') ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(150)],
    }),
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Mensaje del backend tras enviar la solicitud. */
  protected readonly enviado = signal<string | null>(null);
  /** Segundos que faltan para poder pedir otro enlace. */
  protected readonly restante = signal(0);

  private temporizador: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.temporizador));
  }

  protected enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando() || this.restante() > 0) return;

    this.enviando.set(true);
    this.error.set(null);
    this.api.reenviarVerificacion(this.form.controls.email.value.trim()).subscribe({
      next: ({ message }) => {
        this.enviando.set(false);
        this.enviado.set(message);
        this.iniciarEspera();
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.error.set(
          apiErrorMessage(err, 'No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos.'),
        );
      },
    });
  }

  private iniciarEspera(): void {
    clearInterval(this.temporizador);
    this.restante.set(ESPERA_REENVIO_SEGUNDOS);
    this.temporizador = setInterval(() => {
      this.restante.update((n) => n - 1);
      if (this.restante() <= 0) clearInterval(this.temporizador);
    }, 1000);
  }
}
