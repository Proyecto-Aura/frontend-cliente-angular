import { Component, computed, input } from '@angular/core';

import {
  UI_FIELD_CLASSES,
  UI_FIELD_HEIGHTS,
  UI_FIELD_INVALID,
  UiControl,
  UiFieldSize,
} from '../forms/ui-control';
import { UiFieldLabel } from '../forms/ui-field-label';
import { UiFieldMessage } from '../forms/ui-field-message';

export interface UiSelectOption {
  value: string;
  label: string;
}

/**
 * Select nativo del DS con etiqueta y flecha.
 * Uso: `<app-ui-select label="Distrito" placeholder="Selecciona…" [options]="distritos" [formControl]="distrito" />`.
 */
@Component({
  selector: 'app-ui-select',
  imports: [UiFieldLabel, UiFieldMessage],
  host: { class: 'block' },
  templateUrl: './ui-select.html',
})
export class UiSelect extends UiControl<string> {
  readonly options = input.required<readonly UiSelectOption[]>();
  readonly placeholder = input<string | null>(null);
  /** sm 36px (barra de filtros) · md 44px (por defecto) · lg 48px. */
  readonly size = input<UiFieldSize>('md');

  protected readonly fieldClass = computed(() =>
    [
      UI_FIELD_CLASSES,
      UI_FIELD_HEIGHTS[this.size()],
      this.visibleError() ? UI_FIELD_INVALID : 'border-border',
      this.value() === '' ? '!text-muted-foreground' : '',
    ].join(' '),
  );

  protected emptyValue(): string {
    return '';
  }

  protected onChangeEvent(event: Event): void {
    this.setValue((event.target as HTMLSelectElement).value);
  }
}
