import { Component, computed, input } from '@angular/core';

/** Barra de progreso segmentada del registro (N segmentos, `step` de ellos activos). */
@Component({
  selector: 'app-auth-step-progress',
  host: { class: 'block' },
  template: `
    <div class="flex gap-2">
      @for (i of segmentos(); track i) {
        <span
          class="h-[4px] flex-1 rounded-full transition-colors"
          [class.bg-brand-600]="i < step()"
          [class.bg-line-soft]="i >= step()"
        ></span>
      }
    </div>
  `,
})
export class AuthStepProgress {
  readonly step = input.required<number>();
  readonly total = input.required<number>();

  protected readonly segmentos = computed(() =>
    Array.from({ length: this.total() }, (_, i) => i),
  );
}
