import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';
import { AuthSectionHeader } from '../auth-section-header/auth-section-header';
import { AuthStepProgress } from '../auth-step-progress/auth-step-progress';
import { AuthRegisterUserStep } from '../auth-register-user-step/auth-register-user-step';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { RegisterClientePayload } from '../../models/registro.model';
import { fechaNoFutura, hoyISO } from '../../utils/fechas';

/**
 * Registro · RUC 20 (HU-B-002): "Datos de Empresa" (razón social, teléfono y
 * dirección) y "Datos del Contacto". Dos pasos internos. El teléfono y la
 * dirección se guardan en la persona registrada, como en el resto de clientes.
 */
@Component({
  selector: 'app-auth-register-empresa-form',
  imports: [
    ReactiveFormsModule,
    AuthInput,
    AuthSectionHeader,
    AuthStepProgress,
    AuthRegisterUserStep,
  ],
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
  /** El calendario no deja elegir días después de hoy. */
  protected readonly hoy = hoyISO();

  protected readonly form = new FormGroup({
    razonSocial: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6,9}$/)],
    }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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
    fechaNacimiento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, fechaNoFutura()],
    }),
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
      this.c.telefono,
      this.c.direccion,
      this.c.nombres,
      this.c.apellidoPaterno,
      this.c.apellidoMaterno,
      this.c.fechaNacimiento,
    ].every((ctrl) => ctrl.valid);
  }

  protected puedeCrear(): boolean {
    return this.c.email.valid && this.c.username.valid && this.c.password.valid;
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
      telefono: v.telefono.trim(),
      direccion: v.direccion.trim(),
      razon_social: v.razonSocial.trim(),
    };
    this.submitted.emit(payload);
  }
}
