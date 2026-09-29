import { Component, input } from '@angular/core';

/** Etiqueta de campo del DS: 14px seminegrita y asterisco rojo si es obligatorio. */
@Component({
  selector: 'app-ui-field-label',
  host: { class: 'contents' },
  templateUrl: './ui-field-label.html',
})
export class UiFieldLabel {
  readonly for = input.required<string>();
  readonly required = input(false);
}
