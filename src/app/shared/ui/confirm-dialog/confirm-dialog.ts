import { Component, input, output } from '@angular/core';

import { UiButton } from '../button/ui-button';

/**
 * Diálogo de confirmación genérico (reemplaza al AlertDialog de shadcn).
 * El padre lo renderiza con `@if` cuando quiere pedir confirmación.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [UiButton],
  host: { class: 'block' },
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
