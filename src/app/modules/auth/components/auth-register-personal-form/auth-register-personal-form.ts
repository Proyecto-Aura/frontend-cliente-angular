import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';

/** Sub-formulario de datos para persona natural. Los controles los crea el padre. */
@Component({
  selector: 'app-auth-register-personal-form',
  imports: [AuthInput],
  host: { class: 'block space-y-5' },
  template: `
    <app-auth-input
      label="Nombres"
      [control]="nombres()"
      autocomplete="given-name"
      error="Ingresa tus nombres."
    />
    <app-auth-input
      label="Apellidos"
      [control]="apellidos()"
      autocomplete="family-name"
      error="Ingresa tus apellidos."
    />
  `,
})
export class AuthRegisterPersonalForm {
  readonly nombres = input.required<FormControl<string>>();
  readonly apellidos = input.required<FormControl<string>>();
}
