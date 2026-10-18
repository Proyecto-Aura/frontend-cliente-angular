import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthInput } from '../auth-input/auth-input';
import { LoginRequest } from '../../models/auth.model';

/**
 * Formulario de inicio de sesión (HU-B-001). Avisa de los campos vacíos (RF-B05)
 * y emite las credenciales; la API la resuelve el padre.
 */
@Component({
  selector: 'app-auth-login-form',
  imports: [ReactiveFormsModule, RouterLink, AuthInput],
  host: { class: 'block' },
  templateUrl: './auth-login-form.html',
})
export class AuthLoginForm {
  /** El padre lo pone en `true` mientras la petición está en curso. */
  readonly enviando = input(false);
  /** Mensaje de error de la API (credenciales inválidas, etc.). */
  readonly error = input<string | null>(null);

  readonly submitted = output<LoginRequest>();

  protected readonly form = new FormGroup({
    // Un identificador de solo espacios también cuenta como vacío.
    identificador: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    recordar: new FormControl(false, { nonNullable: true }),
  });

  protected get identificador(): FormControl<string> {
    return this.form.controls.identificador;
  }

  protected get password(): FormControl<string> {
    return this.form.controls.password;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identificador, password, recordar } = this.form.getRawValue();
    this.submitted.emit({ identificador: identificador.trim(), password, recordar });
  }
}
