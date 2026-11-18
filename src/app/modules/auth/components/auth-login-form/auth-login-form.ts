import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { AuthInput } from '../auth-input/auth-input';
import { LoginRequest } from '../../models/auth.model';

/**
 * Formulario de inicio de sesión (HU-B-001). Avisa de los campos vacíos (RF-B05,
 * toast amarillo) y emite las credenciales; la API y su error (toast rojo) los
 * resuelve el padre.
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

  readonly submitted = output<LoginRequest>();

  private readonly avisos = inject(Avisos);

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
      this.avisos.mostrar(
        'Faltan campos por completar',
        'Completa tu usuario y contraseña para continuar.',
        'warning',
      );
      return;
    }
    const { identificador, password, recordar } = this.form.getRawValue();
    this.submitted.emit({ identificador: identificador.trim(), password, recordar });
  }
}
