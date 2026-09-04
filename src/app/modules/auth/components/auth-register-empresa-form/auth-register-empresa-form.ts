import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';

/** Sub-formulario de datos para empresa. Los controles los crea el padre. */
@Component({
  selector: 'app-auth-register-empresa-form',
  imports: [AuthInput],
  host: { class: 'block space-y-5' },
  template: `
    <app-auth-input
      label="Razón social"
      [control]="razonSocial()"
      autocomplete="organization"
      error="Ingresa la razón social."
    />
    <app-auth-input
      label="Nombre de contacto"
      [control]="nombreContacto()"
      autocomplete="name"
      error="Ingresa el nombre de la persona de contacto."
    />
  `,
})
export class AuthRegisterEmpresaForm {
  readonly razonSocial = input.required<FormControl<string>>();
  readonly nombreContacto = input.required<FormControl<string>>();
}
