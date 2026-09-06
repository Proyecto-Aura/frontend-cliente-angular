import { Component, input, output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AuthInput } from '../auth-input/auth-input';
import { AuthPasswordStrength } from '../auth-password-strength/auth-password-strength';

/** Paso final compartido del registro: email de acceso + username + contraseña. */
@Component({
  selector: 'app-auth-register-user-step',
  imports: [AuthInput, AuthPasswordStrength],
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-4">
      <app-auth-input
        label="Email de acceso"
        type="email"
        [control]="email()"
        placeholder="correo@ejemplo.com"
        autocomplete="email"
        [maxLength]="150"
        error="Ingresa un correo electrónico válido."
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <app-auth-input
          label="Username"
          [control]="username()"
          placeholder="usuario123"
          autocomplete="username"
          [maxLength]="50"
          error="Solo letras, números y . _ - (máx. 50)."
        />
        <app-auth-input
          label="Contraseña"
          type="password"
          [control]="password()"
          autocomplete="new-password"
          error="Cumple al menos 3 de las reglas de seguridad."
        />
      </div>

      <app-auth-password-strength [password]="pwdValue()" />

      <div class="flex gap-3 pt-2">
        <button
          type="button"
          (click)="back.emit()"
          class="h-[38px] flex-1 rounded-[6px] border border-line-soft text-[15px] font-medium text-ink-soft transition-colors hover:bg-canvas"
        >
          Atrás
        </button>
        <button
          type="button"
          [disabled]="!puedeCrear() || enviando()"
          (click)="submit.emit()"
          class="h-[38px] flex-1 rounded-[6px] border text-[15px] font-medium transition-colors"
          [class.bg-brand-600]="puedeCrear() && !enviando()"
          [class.border-brand-600]="puedeCrear() && !enviando()"
          [class.text-white]="puedeCrear() && !enviando()"
          [class.hover:bg-brand-700]="puedeCrear() && !enviando()"
          [class.bg-line-soft]="!puedeCrear() || enviando()"
          [class.border-line-soft]="!puedeCrear() || enviando()"
          [class.text-muted]="!puedeCrear() || enviando()"
          [class.cursor-not-allowed]="!puedeCrear() || enviando()"
        >
          {{ enviando() ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </div>
    </div>
  `,
})
export class AuthRegisterUserStep {
  readonly email = input.required<FormControl<string>>();
  readonly username = input.required<FormControl<string>>();
  readonly password = input.required<FormControl<string>>();
  readonly puedeCrear = input.required<boolean>();
  readonly enviando = input(false);

  readonly back = output<void>();
  readonly submit = output<void>();

  /** Getter (no señal): se reevalúa en cada ciclo de detección al tipear. */
  protected pwdValue(): string {
    return this.password().value;
  }
}
