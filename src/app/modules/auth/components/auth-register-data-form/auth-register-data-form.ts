import { Component, inject, output } from '@angular/core';
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
import { RegistroPayload, TipoRegistro } from '../../models/registro.model';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmar')?.value;
  return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
}

/** Paso 2 del registro: datos (persona o empresa) + contacto + credenciales. */
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

  readonly submitted = output<RegistroPayload>();

  protected readonly tipo: TipoRegistro = this.store.tipo() ?? 'persona';
  protected readonly documento = this.store.documento();

  protected readonly form = new FormGroup(
    {
      // Persona
      nombres: new FormControl('', { nonNullable: true }),
      apellidos: new FormControl('', { nonNullable: true }),
      // Empresa
      razonSocial: new FormControl('', { nonNullable: true }),
      nombreContacto: new FormControl('', { nonNullable: true }),
      // Común
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      telefono: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{6,15}$/)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
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
    const req = [Validators.required];
    if (this.tipo === 'empresa') {
      this.form.controls.razonSocial.setValidators(req);
      this.form.controls.nombreContacto.setValidators(req);
    } else {
      this.form.controls.nombres.setValidators(req);
      this.form.controls.apellidos.setValidators(req);
    }
    this.form.updateValueAndValidity();
  }

  protected get c() {
    return this.form.controls;
  }

  protected get mismatch(): boolean {
    return (
      this.form.hasError('passwordMismatch') && this.c.confirmar.touched
    );
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const base = {
      tipo: this.tipo,
      documento: this.documento,
      email: v.email,
      telefono: v.telefono,
      password: v.password,
    };
    const payload: RegistroPayload =
      this.tipo === 'empresa'
        ? { ...base, razonSocial: v.razonSocial, nombreContacto: v.nombreContacto }
        : { ...base, nombres: v.nombres, apellidos: v.apellidos };
    this.submitted.emit(payload);
  }
}
