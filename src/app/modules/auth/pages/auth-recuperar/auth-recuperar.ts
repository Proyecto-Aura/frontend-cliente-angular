import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthInput } from '../../components/auth-input/auth-input';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { Alert } from '../../../../shared/ui/alert/alert';
import { Avisos } from '../../../../shared/ui/aviso/aviso';

/**
 * HU-B-003 (RF-B11): el cliente pide el enlace para restablecer su contraseña.
 * Siempre se muestra el mismo mensaje, exista o no el correo.
 */
@Component({
  selector: 'app-auth-recuperar',
  imports: [ReactiveFormsModule, RouterLink, AuthInput, Alert],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-recuperar.html',
})
export class AuthRecuperar {
  private readonly api = inject(AuthApi);
  private readonly avisos = inject(Avisos);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(150)],
    }),
  });
  protected readonly enviando = signal(false);
  /** Mensaje del backend tras enviar la solicitud. */
  protected readonly enviado = signal<string | null>(null);

  protected enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.api.solicitarRecuperacion(this.form.controls.email.value.trim()).subscribe({
      next: ({ message }) => {
        this.enviando.set(false);
        this.enviado.set(message);
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.avisos.mostrar(
          apiErrorMessage(err, 'No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos.'),
          undefined,
          'error',
        );
      },
    });
  }
}
