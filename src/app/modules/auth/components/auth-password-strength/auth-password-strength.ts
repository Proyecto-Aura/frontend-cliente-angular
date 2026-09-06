import { Component, computed, input } from '@angular/core';

import { PASSWORD_RULES, STRENGTH_LEVELS } from '../../utils/password-rules';

/** Medidor de fuerza de contraseña: 5 barras + etiqueta + checklist de reglas. */
@Component({
  selector: 'app-auth-password-strength',
  host: { class: 'block' },
  template: `
    <div class="mt-1 flex flex-col gap-2">
      <div class="flex gap-1.5">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <span
            class="h-[5px] flex-1 rounded-full transition-all"
            [style.background]="password().length > 0 && score() >= i ? level().color : '#e0e0e0'"
          ></span>
        }
      </div>

      @if (password().length > 0) {
        <p class="text-[12px] font-bold" [style.color]="level().color">{{ level().label }}</p>
      }

      <ul class="flex flex-col gap-1.5">
        @for (rule of reglas(); track rule.label) {
          <li class="flex items-center gap-2">
            <span
              class="grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-black transition-colors"
              [class.bg-success-700]="rule.met"
              [class.text-white]="rule.met"
              [class.bg-line-soft]="!rule.met"
              [class.text-muted]="!rule.met"
            >
              {{ rule.met ? '✓' : '×' }}
            </span>
            <span
              class="text-[12px] transition-colors"
              [class.font-medium]="rule.met"
              [class.text-success-700]="rule.met"
              [class.text-muted]="!rule.met"
            >
              {{ rule.label }}
            </span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class AuthPasswordStrength {
  readonly password = input.required<string>();

  protected readonly score = computed(
    () => PASSWORD_RULES.filter((r) => r.test(this.password())).length,
  );
  protected readonly level = computed(() =>
    this.password().length === 0 ? STRENGTH_LEVELS[0] : STRENGTH_LEVELS[this.score()],
  );
  protected readonly reglas = computed(() =>
    PASSWORD_RULES.map((r) => ({ label: r.label, met: r.test(this.password()) })),
  );
}
