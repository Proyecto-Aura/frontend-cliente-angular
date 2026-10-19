import { Component, computed, input } from '@angular/core';

/** Barra de progreso segmentada del registro (N segmentos, `step` de ellos activos). */
@Component({
  selector: 'app-auth-step-progress',
  host: { class: 'block' },
  templateUrl: './auth-step-progress.html',
})
export class AuthStepProgress {
  readonly step = input.required<number>();
  readonly total = input.required<number>();

  protected readonly segmentos = computed(() => Array.from({ length: this.total() }, (_, i) => i));
}
