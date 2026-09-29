import { Component, input, output } from '@angular/core';

import { UiButton } from '../../../../shared/ui';

/** Diálogo de éxito tras crear la cuenta. */
@Component({
  imports: [UiButton],
  selector: 'app-auth-account-created-dialog',
  host: { class: 'block' },
  templateUrl: './auth-account-created-dialog.html',
})
export class AuthAccountCreatedDialog {
  readonly email = input.required<string>();
  readonly confirm = output<void>();
}
