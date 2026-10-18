import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';
import { AuthSectionHeader } from '../auth-section-header/auth-section-header';
import { AuthStepProgress } from '../auth-step-progress/auth-step-progress';
import { AuthRegisterUserStep } from '../auth-register-user-step/auth-register-user-step';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { RegisterClientePayload } from '../../models/registro.model';
import { fechaNoFutura, hoyISO } from '../../utils/fechas';

/** Registro · datos de persona natural (DNI / CE / Pasaporte / RUC 10). Dos pasos internos. */
@Component({
  selector: 'app-auth-register-personal-form',
  imports: [
    ReactiveFormsModule,
    AuthInput,
    AuthSectionHeader,
    AuthStepProgress,
    AuthRegisterUserStep,
  ],
  host: { class: 'block' },
  templateUrl: './auth-register-personal-form.html',
})
export class AuthRegisterPersonalForm {
  private readonly store = inject(AuthRegistroStore);

  readonly enviando = input(false);
  readonly error = input<string | null>(null);
  readonly submitted = output<RegisterClientePayload>();

  protected readonly paso = signal<1 | 2>(1);
  protected readonly doc = this.store.doc();
  /** El calendario no deja elegir días después de hoy. */
  protected readonly hoy = hoyISO();

  protected readonly form = new FormGroup({
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
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6,9}$/)],
    }),
    fechaNacimiento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, fechaNoFutura()],
    }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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

  /** Getters (no señales): se reevalúan en cada ciclo de detección. */
  protected puedePaso1(): boolean {
    return [
      this.c.nombres,
      this.c.apellidoPaterno,
      this.c.apellidoMaterno,
      this.c.telefono,
      this.c.fechaNacimiento,
      this.c.direccion,
    ].every((ctrl) => ctrl.valid);
  }

  protected puedeCrear(): boolean {
    return this.c.email.valid && this.c.username.valid && this.c.password.valid;
  }

  protected continuar(): void {
    if (!this.puedePaso1()) {
      this.c.nombres.markAsTouched();
      this.c.apellidoPaterno.markAsTouched();
      this.c.apellidoMaterno.markAsTouched();
      this.c.telefono.markAsTouched();
      this.c.fechaNacimiento.markAsTouched();
      this.c.direccion.markAsTouched();
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
      tipo_cliente: 'persona_natural',
      categoria_cliente: 'minorista',
      email: v.email.trim(),
      username: v.username.trim(),
      password: v.password,
      telefono: v.telefono.trim(),
      fecha_nacimiento: v.fechaNacimiento,
      direccion: v.direccion.trim(),
    };
    this.submitted.emit(payload);
  }
}
