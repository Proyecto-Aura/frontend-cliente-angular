import { Component, computed, input, signal } from '@angular/core';

import { UI_FIELD_CLASSES, UiControl } from '../forms/ui-control';
import { UiFieldMessage } from '../forms/ui-field-message';

/**
 * Campo de texto con etiqueta. Si `type` es `password` añade el botón
 * mostrar/ocultar. Uso: `<app-ui-input label="Correo" type="email" [formControl]="email" />`.
 */
@Component({
  selector: 'app-ui-input',
  imports: [UiFieldMessage],
  host: { class: 'block' },
  templateUrl: './ui-input.html',
})
export class UiInput extends UiControl<string> {
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'search'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);
  readonly inputMode = input<string | null>(null);
  readonly maxLength = input<number | null>(null);

  protected readonly fieldClasses = UI_FIELD_CLASSES;
  protected readonly show = signal(false);
  protected readonly resolvedType = computed(() =>
    this.type() === 'password' ? (this.show() ? 'text' : 'password') : this.type(),
  );

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value);
  }
}
