import { Component, input, output } from '@angular/core';

import { UiButton } from '../button/ui-button';
import { UiModal } from '../modal/ui-modal';

/**
 * Diálogo de confirmación genérico sobre `app-ui-modal` (DS): cabecera roja, mensaje
 * y acciones Cancelar / Confirmar en el pie. El padre lo renderiza con `@if`.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [UiButton, UiModal],
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
