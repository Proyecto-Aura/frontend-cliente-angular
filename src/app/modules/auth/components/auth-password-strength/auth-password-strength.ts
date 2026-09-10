import { Component, computed, input } from '@angular/core';

import { PASSWORD_RULES, STRENGTH_LEVELS } from '../../utils/password-rules';

/** Medidor de fuerza de contraseña: 5 barras + etiqueta + checklist de reglas. */
@Component({
  selector: 'app-auth-password-strength',
  host: { class: 'block' },
  templateUrl: './auth-password-strength.html',
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
