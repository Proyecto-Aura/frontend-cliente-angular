import { Component, computed, input } from '@angular/core';

export type UiTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

const TONES: Record<UiTone, string> = {
  success: 'bg-success-50 text-success-700',
  warning: 'bg-[#fefce8] text-[#a16207]',
  info: 'bg-[#eff6ff] text-[#1d4ed8]',
  danger: 'bg-[#fee2e2] text-brand-700',
  neutral: 'bg-line-soft text-ink-soft',
};

/**
 * Etiqueta de estado (pago, entrega, stock, reembolso…). El icono opcional va
 * como contenido: `<app-ui-badge tone="success"><svg …/> Pagado</app-ui-badge>`.
 */
@Component({
  selector: 'app-ui-badge',
  host: { '[class]': 'classes()' },
  templateUrl: './ui-badge.html',
})
export class UiBadge {
  readonly tone = input<UiTone>('neutral');

  protected readonly classes = computed(
    () =>
      `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${TONES[this.tone()]}`,
  );
}
