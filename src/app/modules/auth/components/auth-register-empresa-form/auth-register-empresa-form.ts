import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';

/**
 * Sub-formulario de empresa: solo la razón social (el backend además exige los
 * datos de la persona de contacto vía `auth-register-personal-form`).
 */
@Component({
  selector: 'app-auth-register-empresa-form',
  imports: [AuthInput],
  host: { class: 'block' },
  template: `
    <app-auth-input
      label="Razón social"
      [control]="razonSocial()"
      autocomplete="organization"
      [maxLength]="200"
      error="Ingresa la razón social de la empresa."
    />
  `,
})
export class AuthRegisterEmpresaForm {
  readonly razonSocial = input.required<FormControl<string>>();
}
