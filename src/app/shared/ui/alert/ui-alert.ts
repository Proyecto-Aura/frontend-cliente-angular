import { Component, computed, input } from '@angular/core';

export type UiAlertTone = 'success' | 'info' | 'warning' | 'danger';

/** Tintes semánticos del DS: fondo tenue + texto oscurecido, sin bordes de color. */
const TONES: Record<UiAlertTone, string> = {
  success: 'bg-success-50 text-success-700',
  info: 'bg-info-50 text-info-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

/**
 * Aviso en línea (entrega estimada, pasarela de pago, stock bajo, error de formulario).
 * El DS no define un Alert: se construye con sus tintes semánticos (como los badges).
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

  protected readonly classes = computed(
    () => `flex items-center gap-2.5 rounded-lg px-4 py-3 text-[12px] font-medium ${TONES[this.tone()]}`,
  );
}
