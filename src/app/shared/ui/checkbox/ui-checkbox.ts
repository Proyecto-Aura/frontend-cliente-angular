import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { UiControl } from '../forms/ui-control';
import { UiFieldMessage } from '../forms/ui-field-message';

/**
 * Checkbox con texto. El texto va como contenido:
 * `<app-ui-checkbox [formControl]="acepta">Acepto los términos</app-ui-checkbox>`.
 */
@Component({
  selector: 'app-ui-checkbox',
  imports: [UiFieldMessage],
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiCheckbox), multi: true }],
  templateUrl: './ui-checkbox.html',
})
export class UiCheckbox extends UiControl<boolean> {
  protected emptyValue(): boolean {
    return false;
  }

  protected onToggle(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.onTouched();
  }
}
