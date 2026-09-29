import { Component, computed, input } from '@angular/core';

export type UiTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type UiBadgeSize = 'sm' | 'md';

/** Fondo tenue + texto oscurecido de cada tono (DS). */
const TONES: Record<UiTone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: 'bg-neutral-50', fg: 'text-neutral-700', dot: 'bg-neutral-700' },
  brand: { bg: 'bg-accent', fg: 'text-primary', dot: 'bg-primary' },
  success: { bg: 'bg-success-50', fg: 'text-success-700', dot: 'bg-success-700' },
  warning: { bg: 'bg-warning-50', fg: 'text-warning-700', dot: 'bg-warning-700' },
  danger: { bg: 'bg-danger-50', fg: 'text-danger-700', dot: 'bg-danger-700' },
  info: { bg: 'bg-info-50', fg: 'text-info-700', dot: 'bg-info-700' },
};

const SIZES: Record<UiBadgeSize, string> = {
  sm: 'h-6 px-2.5 text-[12px]',
  md: 'h-8 px-3.5 text-[14px]',
};

/**
 * Etiqueta de estado del DS (pago, entrega, stock, reembolso). El estado se marca con
 * un punto de color (`dot`), no con emoji. Un icono opcional va como contenido:
 * `<app-ui-badge tone="success" dot>Pagado</app-ui-badge>`.
 */
@Component({
  selector: 'app-ui-badge',
  host: { '[class]': 'classes()' },
  templateUrl: './ui-badge.html',
})
export class UiBadge {
  readonly tone = input<UiTone>('neutral');
  readonly size = input<UiBadgeSize>('sm');
  /** Muestra el punto de color del tono antes del texto. */
  readonly dot = input(false, { transform: (v: boolean | '') => v !== false });

  protected readonly dotClass = computed(() => TONES[this.tone()].dot);
  protected readonly classes = computed(() => {
    const t = TONES[this.tone()];
    return `inline-flex items-center gap-2 whitespace-nowrap rounded-full font-medium ${t.bg} ${t.fg} ${SIZES[this.size()]}`;
  });
}
