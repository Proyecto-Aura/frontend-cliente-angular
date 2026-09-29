import { Component, computed, input } from '@angular/core';

import { UI_FIELD_CLASSES, UI_FIELD_INVALID, UiControl } from '../forms/ui-control';
import { UiFieldLabel } from '../forms/ui-field-label';
import { UiFieldMessage } from '../forms/ui-field-message';

/** Área de texto del DS con etiqueta. Uso: `<app-ui-textarea label="Motivo" [rows]="4" [formControl]="motivo" />`. */
@Component({
  selector: 'app-ui-textarea',
  imports: [UiFieldLabel, UiFieldMessage],
  host: { class: 'block' },
  templateUrl: './ui-textarea.html',
})
export class UiTextarea extends UiControl<string> {
  readonly placeholder = input('');
  readonly rows = input(4);
  readonly maxLength = input<number | null>(null);

  protected readonly fieldClass = computed(
    () => `${UI_FIELD_CLASSES} ${this.visibleError() ? UI_FIELD_INVALID : 'border-border'}`,
  );

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLTextAreaElement).value);
  }
}
