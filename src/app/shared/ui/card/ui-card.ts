import { Component, computed, input } from '@angular/core';

export type UiCardPadding = 'none' | 'sm' | 'md';

const PADDINGS: Record<UiCardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
};

/**
 * Card del DS: fondo blanco, borde 1px, radio 8px y sombra casi invisible.
 * Cabecera opcional (`title`, `subtitle` y acciones con `slot="actions"`), cuerpo con
 * padding de 20px y pie opcional sobre gris (`slot="footer"`). El layout interno del
 * cuerpo se da con `bodyClass` (ej. `bodyClass="gap-4"`). Las tablas van con `padding="none"`.
 */
@Component({
  selector: 'app-ui-card',
  host: { class: 'flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xs' },
  templateUrl: './ui-card.html',
})
export class UiCard {
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly padding = input<UiCardPadding>('md');
  /** Clases extra del cuerpo (es flex en columna): `gap-*`, `items-center`, etc. */
  readonly bodyClass = input('');

  protected readonly bodyClasses = computed(
    () => `flex flex-1 flex-col ${PADDINGS[this.padding()]} ${this.bodyClass()}`,
  );
}
