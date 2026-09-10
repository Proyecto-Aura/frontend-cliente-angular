import { Component, inject, input, output } from '@angular/core';

import { AuthRegisterEmpresaForm } from '../auth-register-empresa-form/auth-register-empresa-form';
import { AuthRegisterPersonalForm } from '../auth-register-personal-form/auth-register-personal-form';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { RegisterClientePayload } from '../../models/registro.model';

/** Paso 2 del registro: muestra el formulario de empresa (RUC) o el de persona. */
@Component({
  selector: 'app-auth-register-data-form',
  imports: [AuthRegisterPersonalForm, AuthRegisterEmpresaForm],
  host: { class: 'block' },
  templateUrl: './auth-register-data-form.html',
})
export class AuthRegisterDataForm {
  protected readonly store = inject(AuthRegistroStore);

  readonly enviando = input(false);
  readonly error = input<string | null>(null);
  readonly submitted = output<RegisterClientePayload>();
}
