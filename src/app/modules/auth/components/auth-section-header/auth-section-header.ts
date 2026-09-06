import { Component, input } from '@angular/core';

/** Encabezado de sección de un paso del registro: círculo numerado + título + "n/total". */
@Component({
  selector: 'app-auth-section-header',
  host: { class: 'block' },
  template: `
    <div class="flex items-center gap-3">
      <span class="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
        {{ step() }}
      </span>
      <span class="text-[14px] font-semibold text-label">{{ title() }}</span>
      <span class="h-px flex-1 bg-line-soft"></span>
      <span class="text-[12px] text-muted">{{ step() }}/{{ total() }}</span>
    </div>
  `,
})
export class AuthSectionHeader {
  readonly step = input.required<number>();
  readonly total = input.required<number>();
  readonly title = input.required<string>();
}
