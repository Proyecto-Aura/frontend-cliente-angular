import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthInput } from '../auth-input/auth-input';

export interface LoginCredentials {
  usuario: string;
  password: string;
  recordar: boolean;
}

/** Formulario de inicio de sesión. Emite las credenciales; la navegación/API la resuelve el padre. */
@Component({
  selector: 'app-auth-login-form',
  imports: [ReactiveFormsModule, RouterLink, AuthInput],
  host: { class: 'block' },
  templateUrl: './auth-login-form.html',
})
export class AuthLoginForm {
  readonly submitted = output<LoginCredentials>();

  protected readonly enviando = signal(false);

  protected readonly form = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    recordar: new FormControl(false, { nonNullable: true }),
  });

  protected get usuario(): FormControl<string> {
    return this.form.controls.usuario;
  }

  protected get password(): FormControl<string> {
    return this.form.controls.password;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
