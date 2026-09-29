import { Component, computed, input } from '@angular/core';

export type UiAlertTone = 'success' | 'info' | 'warning' | 'danger';

const TONES: Record<UiAlertTone, string> = {
  success: 'gap-2.5 rounded-xl border border-[#bbf7d0] bg-success-50 px-4 py-2.5 text-[12px] font-medium text-success-700',
  info: 'gap-2 rounded-xl border border-[#c7d7fd] bg-[#f0f4ff] px-4 py-2.5 text-[12px] font-medium text-[#4338ca]',
  warning: 'gap-2 rounded-xl border border-[#fcd34d] bg-[#fef3c7] px-4 py-2.5 text-[12px] font-medium text-[#92400e]',
  danger: 'rounded-lg bg-brand-50 px-4 py-3 text-[13px] text-brand-700',
};

/**
 * Aviso en línea (entrega estimada, pasarela de pago, stock bajo, error de formulario).
 * El icono, si lleva, va como contenido junto al texto:
 * `<app-ui-alert tone="success"><svg …/> Entrega estimada…</app-ui-alert>`.
 */
@Component({
  selector: 'app-ui-alert',
  host: {
    '[class]': 'classes()',
    '[attr.role]': "tone() === 'danger' ? 'alert' : 'status'",
  },
  templateUrl: './ui-alert.html',
})
export class UiAlert {
  readonly tone = input<UiAlertTone>('info');

  protected readonly classes = computed(() => `animate-fade-in flex items-center ${TONES[this.tone()]}`);
}
