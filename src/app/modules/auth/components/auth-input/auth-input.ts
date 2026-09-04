import { Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Campo de formulario reutilizable para el módulo auth: etiqueta + input.
 * Recibe un `FormControl` ya creado por el formulario padre. Si `type` es
 * `password` añade el botón mostrar/ocultar. Muestra `error` cuando el control
 * está `touched` e inválido.
 */
@Component({
  selector: 'app-auth-input',
  imports: [ReactiveFormsModule],
  host: { class: 'block' },
  template: `
    <label class="block">
      <span class="mb-1.5 flex items-center justify-between gap-2">
        <span class="text-sm font-semibold text-ink">{{ label() }}</span>
        <ng-content select="[slot=action]" />
      </span>

      <span class="relative block">
        <input
          [type]="resolvedType()"
          [formControl]="control()"
          [placeholder]="placeholder()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputMode()"
          [attr.maxlength]="maxLength()"
          [class.pr-11]="type() === 'password'"
          [class.border-line]="!showError()"
          [class.border-brand-600]="showError()"
          class="w-full rounded-[10px] border bg-surface px-4 py-3.5 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />

        @if (type() === 'password') {
          <button
            type="button"
            (click)="show.set(!show())"
            [attr.aria-label]="show() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            class="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-ink-soft"
          >
            @if (show()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          </button>
        }
      </span>

      @if (showError()) {
        <span class="mt-1.5 block text-xs text-brand-600">{{ error() }}</span>
      } @else if (hint()) {
        <span class="mt-1.5 block text-xs text-muted">{{ hint() }}</span>
      }
    </label>
  `,
})
export class AuthInput {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly type = input<'text' | 'email' | 'password' | 'tel'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);
  readonly inputMode = input<string | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly hint = input<string | null>(null);
  /** Mensaje a mostrar cuando el control esté `touched` e inválido. */
  readonly error = input<string | null>(null);

  protected readonly show = signal(false);
  protected readonly resolvedType = computed(() =>
    this.type() === 'password' ? (this.show() ? 'text' : 'password') : this.type(),
  );

  /** Método (no computed): depende de `touched`/`invalid`, que no son señales. */
  protected showError(): boolean {
    const c = this.control();
    return !!this.error() && c.touched && c.invalid;
  }
}
