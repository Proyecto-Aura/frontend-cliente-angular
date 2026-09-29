import { Component, input } from '@angular/core';

/** Texto de ayuda o de error bajo un campo. Su id es `<for>-msg` (para `aria-describedby`). */
@Component({
  selector: 'app-ui-field-message',
  host: { class: 'contents' },
  templateUrl: './ui-field-message.html',
})
export class UiFieldMessage {
  readonly for = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
}
