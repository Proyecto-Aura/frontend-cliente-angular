import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { UI_FIELD_CLASSES, UiControl } from '../forms/ui-control';
import { UiFieldMessage } from '../forms/ui-field-message';

export interface UiSelectOption {
  value: string;
  label: string;
}

/**
 * Select nativo con etiqueta y flecha.
 * Uso: `<app-ui-select label="Distrito" placeholder="Selecciona…" [options]="distritos" [formControl]="distrito" />`.
 */
@Component({
  selector: 'app-ui-select',
  imports: [UiFieldMessage],
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelect), multi: true }],
  templateUrl: './ui-select.html',
})
export class UiSelect extends UiControl<string> {
  readonly options = input.required<readonly UiSelectOption[]>();
  readonly placeholder = input<string | null>(null);

  protected readonly fieldClasses = UI_FIELD_CLASSES;

  protected emptyValue(): string {
    return '';
  }

  protected onChangeEvent(event: Event): void {
    this.setValue((event.target as HTMLSelectElement).value);
  }
}
