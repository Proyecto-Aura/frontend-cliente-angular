import { Component, computed, input } from '@angular/core';

/** Indicador de pasos del registro: círculos numerados + conector. */
@Component({
  selector: 'app-auth-stepper',
  host: { class: 'block' },
  template: `
    <ol class="flex items-center gap-3">
      @for (step of items(); track step.label) {
        <li class="flex items-center gap-3" [class.flex-1]="!step.last">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition"
            [class.border-brand-600]="step.index <= current()"
            [class.bg-brand-600]="step.index <= current()"
            [class.text-white]="step.index <= current()"
            [class.border-line]="step.index > current()"
            [class.text-muted]="step.index > current()"
          >
            {{ step.index + 1 }}
          </span>
          <span
            class="text-sm font-medium"
            [class.text-ink]="step.index <= current()"
            [class.text-muted]="step.index > current()"
          >
            {{ step.label }}
          </span>
          @if (!step.last) {
            <span class="h-px flex-1" [class.bg-brand-600]="step.index < current()" [class.bg-line]="step.index >= current()"></span>
          }
        </li>
      }
    </ol>
  `,
})
export class AuthStepper {
  readonly steps = input.required<string[]>();
  /** Índice (0-based) del paso activo. */
  readonly current = input.required<number>();

  protected readonly items = computed(() =>
    this.steps().map((label, index, arr) => ({
      label,
      index,
      last: index === arr.length - 1,
    })),
  );
}
