import { Component } from '@angular/core';

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
