import { Component, computed, input } from '@angular/core';

export type UiCardVariant = 'default' | 'danger' | 'interactive';
export type UiCardPadding = 'none' | 'sm' | 'md';

const VARIANTS: Record<UiCardVariant, string> = {
  default: 'border-[#f0f0f0]',
  danger: 'border-[#fca5a5]',
  interactive:
    'border-[#f0f0f0] transition-all duration-200 hover:border-[#e8e8e8] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)]',
};

const PADDINGS: Record<UiCardPadding, string> = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
};

/**
 * Contenedor blanco con borde suave y esquinas redondeadas.
 * Es un contenedor flex en columna: el espaciado interno se da con `class="gap-4"`.
 * `danger` es para zonas sensibles (ej. eliminar cuenta); `interactive` para cards clicables.
 */
@Component({
  selector: 'app-ui-card',
  host: { '[class]': 'classes()' },
  templateUrl: './ui-card.html',
})
export class UiCard {
  readonly variant = input<UiCardVariant>('default');
  readonly padding = input<UiCardPadding>('md');

  protected readonly classes = computed(
    () =>
      `flex flex-col overflow-hidden rounded-2xl border bg-surface ${VARIANTS[this.variant()]} ${PADDINGS[this.padding()]}`,
  );
}
