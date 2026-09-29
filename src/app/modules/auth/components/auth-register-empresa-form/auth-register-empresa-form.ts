import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UiAlert, UiButton, UiInput, UiStepProgress } from '../../../../shared/ui';
import { AuthSectionHeader } from '../auth-section-header/auth-section-header';
import { AuthRegisterUserStep } from '../auth-register-user-step/auth-register-user-step';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { passwordScore, PASSWORD_MIN_SCORE } from '../../utils/password-rules';
import { RegisterClientePayload } from '../../models/registro.model';

/**
 * Registro · datos de empresa (RUC). Dos pasos internos.
 * Nota: el teléfono y la dirección fiscal de la empresa aún no tienen campo en
 * `RegisterClienteDto`; se añadirán cuando el backend los soporte.
 */
@Component({
  selector: 'app-auth-register-empresa-form',
  imports: [ReactiveFormsModule, AuthSectionHeader, AuthRegisterUserStep, UiAlert, UiButton, UiInput, UiStepProgress],
  host: { class: 'block' },
  templateUrl: './auth-register-empresa-form.html',
})
export class AuthRegisterEmpresaForm {
  private readonly store = inject(AuthRegistroStore);

  readonly enviando = input(false);
  readonly error = input<string | null>(null);
  readonly submitted = output<RegisterClientePayload>();

  protected readonly paso = signal<1 | 2>(1);
  protected readonly doc = this.store.doc();

  protected readonly form = new FormGroup({
    razonSocial: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    nombres: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    apellidoPaterno: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    apellidoMaterno: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    fechaNacimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(150)],
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(255)],
    }),
  });

  protected get c() {
    return this.form.controls;
  }

  protected puedePaso1(): boolean {
    return [
      this.c.razonSocial,
      this.c.nombres,
      this.c.apellidoPaterno,
      this.c.apellidoMaterno,
      this.c.fechaNacimiento,
    ].every((ctrl) => ctrl.valid);
  }

  protected puedeCrear(): boolean {
    return (
      this.c.email.valid &&
      this.c.username.valid &&
      this.c.password.valid &&
      passwordScore(this.c.password.value) >= PASSWORD_MIN_SCORE
    );
  }

  protected continuar(): void {
    if (!this.puedePaso1()) {
      Object.values(this.c).forEach((ctrl) => ctrl.markAsTouched());
      return;
    }
    this.paso.set(2);
  }

  protected onSubmit(): void {
    if (!this.puedeCrear() || !this.doc) return;
    const v = this.form.getRawValue();
    const payload: RegisterClientePayload = {
      nombres: v.nombres.trim(),
      apellido_paterno: v.apellidoPaterno.trim(),
      apellido_materno: v.apellidoMaterno.trim(),
      tipo_documento: this.doc.tipoDocumento,
      numero_documento: this.doc.numeroDocumento,
      tipo_cliente: 'empresa',
      categoria_cliente: 'minorista',
      email: v.email.trim(),
      username: v.username.trim(),
      password: v.password,
      fecha_nacimiento: v.fechaNacimiento,
      razon_social: v.razonSocial.trim(),
    };
    this.submitted.emit(payload);
  }
}
