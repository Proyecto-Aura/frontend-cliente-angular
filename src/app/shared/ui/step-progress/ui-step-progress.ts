import { Component, computed, input } from '@angular/core';

/** Barra de progreso segmentada (N segmentos, `step` de ellos activos). Uso: `<app-ui-step-progress [step]="1" [total]="3" />`. */
@Component({
  selector: 'app-ui-step-progress',
  host: { class: 'block' },
  templateUrl: './ui-step-progress.html',
})
export class UiStepProgress {
  readonly step = input.required<number>();
  readonly total = input.required<number>();

  protected readonly segments = computed(() => Array.from({ length: this.total() }, (_, i) => i));
}
