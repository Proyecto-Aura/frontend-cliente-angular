import { Component, input } from '@angular/core';

import { UiControl } from '../forms/ui-control';
import { UiFieldMessage } from '../forms/ui-field-message';

/**
 * Checkbox del DS (caja de 22px, radio 6px, relleno rojo al marcar). El texto va como contenido:
 * `<app-ui-checkbox [formControl]="acepta" description="Opcional">Acepto los términos</app-ui-checkbox>`.
 */
@Component({
  selector: 'app-ui-checkbox',
  imports: [UiFieldMessage],
  host: { class: 'block' },
  templateUrl: './ui-checkbox.html',
})
export class UiCheckbox extends UiControl<boolean> {
  /** Texto secundario bajo la etiqueta (12px gris). */
  readonly description = input<string | null>(null);

  protected emptyValue(): boolean {
    return false;
  }

  protected onToggle(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.onTouched();
  }
}
