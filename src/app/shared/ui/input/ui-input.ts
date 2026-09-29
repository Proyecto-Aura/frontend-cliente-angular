import { Component, computed, input, signal } from '@angular/core';

import {
  UI_FIELD_CLASSES,
  UI_FIELD_HEIGHTS,
  UI_FIELD_INVALID,
  UiControl,
  UiFieldSize,
} from '../forms/ui-control';
import { UiFieldLabel } from '../forms/ui-field-label';
import { UiFieldMessage } from '../forms/ui-field-message';

/**
 * Campo de texto del DS con etiqueta. Si `type` es `password` añade el botón
 * mostrar/ocultar. Uso: `<app-ui-input label="Correo" type="email" [formControl]="email" />`.
 * Un enlace junto a la etiqueta (ej. "¿Olvidaste tu contraseña?") va con `slot="action"`.
 */
@Component({
  selector: 'app-ui-input',
  imports: [UiFieldLabel, UiFieldMessage],
  host: { class: 'block' },
  templateUrl: './ui-input.html',
})
export class UiInput extends UiControl<string> {
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'search'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);
  readonly inputMode = input<string | null>(null);
  readonly maxLength = input<number | null>(null);
  /** sm 36px (barra de filtros) · md 44px (por defecto) · lg 48px. */
  readonly size = input<UiFieldSize>('md');
  /** Solo lectura (ej. "Ciudad: Lima"): fondo gris y texto tenue. */
  readonly readonly = input(false);

  protected readonly show = signal(false);
  protected readonly resolvedType = computed(() =>
    this.type() === 'password' ? (this.show() ? 'text' : 'password') : this.type(),
  );
  protected readonly fieldClass = computed(() =>
    [
      UI_FIELD_CLASSES,
      UI_FIELD_HEIGHTS[this.size()],
      this.visibleError() ? UI_FIELD_INVALID : 'border-border',
      this.type() === 'password' ? 'pr-11' : '',
    ].join(' '),
  );

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value);
  }
}
