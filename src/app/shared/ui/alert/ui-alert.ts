import { Component, computed, input } from '@angular/core';

import { UiTone } from '../badge/ui-badge';

const TONES: Record<UiTone, string> = {
  success: 'border-[#bbf7d0] bg-success-50 text-success-700',
  warning: 'border-[#fde68a] bg-[#fefce8] text-[#92400e]',
  info: 'border-[#c7d7fd] bg-[#f0f4ff] text-[#1d4ed8]',
  danger: 'border-[#fca5a5] bg-brand-50 text-brand-700',
  neutral: 'border-line-soft bg-canvas text-ink-soft',
};

/**
 * Aviso en línea con icono según el tono. El texto va como contenido:
 * `<app-ui-alert tone="warning">Tu solicitud será revisada…</app-ui-alert>`.
 * Los tonos `danger` y `warning` se anuncian como `alert` a lectores de pantalla.
 */
@Component({
  selector: 'app-ui-alert',
  host: {
    '[class]': 'classes()',
    '[attr.role]': "tone() === 'danger' || tone() === 'warning' ? 'alert' : 'status'",
  },
  templateUrl: './ui-alert.html',
})
export class UiAlert {
  readonly tone = input<UiTone>('info');
  readonly title = input<string | null>(null);

  protected readonly classes = computed(
    () =>
      `animate-fade-in flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[12px] leading-relaxed ${TONES[this.tone()]}`,
  );
}
