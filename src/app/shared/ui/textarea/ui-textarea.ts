import { Component, input } from '@angular/core';

import { UI_FIELD_CLASSES, UiControl } from '../forms/ui-control';
import { UiFieldMessage } from '../forms/ui-field-message';

/** Área de texto con etiqueta. Uso: `<app-ui-textarea label="Motivo" [rows]="4" [formControl]="motivo" />`. */
@Component({
  selector: 'app-ui-textarea',
  imports: [UiFieldMessage],
  host: { class: 'block' },
  templateUrl: './ui-textarea.html',
})
export class UiTextarea extends UiControl<string> {
  readonly placeholder = input('');
  readonly rows = input(4);
  readonly maxLength = input<number | null>(null);

  protected readonly fieldClasses = UI_FIELD_CLASSES;

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLTextAreaElement).value);
  }
}
