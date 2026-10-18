import { Component, input, output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';
import { AuthPasswordStrength } from '../auth-password-strength/auth-password-strength';

/** Paso final compartido del registro: email de acceso + username + contraseña. */
@Component({
  selector: 'app-auth-register-user-step',
  imports: [AuthInput, AuthPasswordStrength],
  host: { class: 'block' },
  templateUrl: './auth-register-user-step.html',
})
export class AuthRegisterUserStep {
  readonly email = input.required<FormControl<string>>();
  readonly username = input.required<FormControl<string>>();
  readonly password = input.required<FormControl<string>>();
  readonly puedeCrear = input.required<boolean>();
  readonly enviando = input(false);

  readonly back = output<void>();
  readonly crear = output<void>();

  /** Getter (no señal): se reevalúa en cada ciclo de detección al tipear. */
  protected pwdValue(): string {
    return this.password().value;
  }
}
