import { Component, input, output } from '@angular/core';

/** Diálogo de éxito tras crear la cuenta. */
@Component({
  selector: 'app-auth-account-created-dialog',
  host: { class: 'block' },
  templateUrl: './auth-account-created-dialog.html',
})
export class AuthAccountCreatedDialog {
  readonly email = input.required<string>();
  readonly confirm = output<void>();
}
