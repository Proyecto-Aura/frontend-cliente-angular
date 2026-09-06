import { Component, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthInput } from '../auth-input/auth-input';
import { AuthRegisterEmpresaForm } from '../auth-register-empresa-form/auth-register-empresa-form';
import { AuthRegisterPersonalForm } from '../auth-register-personal-form/auth-register-personal-form';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { RegisterClientePayload, RegistroDocumento } from '../../models/registro.model';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmar')?.value;
  return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
}

/** Paso 2 del registro: datos de la persona (+ empresa) + credenciales. */
@Component({
  selector: 'app-auth-register-data-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthInput,
    AuthRegisterPersonalForm,
    AuthRegisterEmpresaForm,
  ],
  host: { class: 'block' },
  templateUrl: './auth-register-data-form.html',
})
export class AuthRegisterDataForm {
  private readonly store = inject(AuthRegistroStore);

  /** El padre lo pone en `true` mientras la petición está en curso. */
  readonly enviando = input(false);
  /** Mensaje de error de la API (409 documento/email/username duplicado, etc.). */
  readonly error = input<string | null>(null);

  readonly submitted = output<RegisterClientePayload>();

  protected readonly doc: RegistroDocumento = this.store.doc() ?? {
    tipo: 'persona',
    tipoDocumento: 'dni',
    tipoCliente: 'persona_natural',
    numeroDocumento: '',
  };
  protected readonly esEmpresa = this.doc.tipoCliente === 'empresa';

  protected readonly form = new FormGroup(
    {
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
      razonSocial: new FormControl('', { nonNullable: true }),
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
      telefono: new FormControl('', {
        nonNullable: true,
        validators: [Validators.pattern(/^\d{6,9}$/)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(255)],
      }),
      confirmar: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      terminos: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: passwordsMatch },
  );

  constructor() {
    if (this.esEmpresa) {
      this.form.controls.razonSocial.setValidators([
        Validators.required,
        Validators.maxLength(200),
      ]);
      this.form.controls.razonSocial.updateValueAndValidity();
    }
  }

  protected get c() {
    return this.form.controls;
  }

  protected get mismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.c.confirmar.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: RegisterClientePayload = {
      nombres: v.nombres.trim(),
      apellido_paterno: v.apellidoPaterno.trim(),
      apellido_materno: v.apellidoMaterno.trim(),
      tipo_documento: this.doc.tipoDocumento,
      numero_documento: this.doc.numeroDocumento,
      tipo_cliente: this.doc.tipoCliente,
      categoria_cliente: 'minorista',
      email: v.email.trim(),
      username: v.username.trim(),
      password: v.password,
    };
    if (v.telefono.trim()) payload.telefono = v.telefono.trim();
    if (this.esEmpresa) payload.razon_social = v.razonSocial.trim();

    this.submitted.emit(payload);
  }
}
