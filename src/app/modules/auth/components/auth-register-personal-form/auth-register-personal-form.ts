import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';

/**
 * Sub-formulario de datos de la persona (natural o representante de la empresa).
 * Los controles los crea el padre. Coincide con `RegisterClienteDto`: nombres,
 * apellido_paterno, apellido_materno.
 */
@Component({
  selector: 'app-auth-register-personal-form',
  imports: [AuthInput],
  host: { class: 'block space-y-5' },
  template: `
    <app-auth-input
      label="Nombres"
      [control]="nombres()"
      autocomplete="given-name"
      [maxLength]="100"
      error="Ingresa los nombres."
    />
    <div class="grid gap-5 sm:grid-cols-2">
      <app-auth-input
        label="Apellido paterno"
        [control]="apellidoPaterno()"
        autocomplete="family-name"
        [maxLength]="100"
        error="Ingresa el apellido paterno."
      />
      <app-auth-input
        label="Apellido materno"
        [control]="apellidoMaterno()"
        [maxLength]="100"
        error="Ingresa el apellido materno."
      />
    </div>
  `,
})
export class AuthRegisterPersonalForm {
  readonly nombres = input.required<FormControl<string>>();
  readonly apellidoPaterno = input.required<FormControl<string>>();
  readonly apellidoMaterno = input.required<FormControl<string>>();
}
