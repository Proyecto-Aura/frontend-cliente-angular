import { Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Campo de formulario reutilizable del módulo auth: etiqueta + input, al estilo
 * del prototipo del portal cliente. Recibe un `FormControl` ya creado por el
 * padre. Si `type` es `password` añade el botón mostrar/ocultar. Muestra `error`
 * cuando el control está `touched` e inválido.
 */
@Component({
  selector: 'app-auth-input',
  imports: [ReactiveFormsModule],
  host: { class: 'block' },
  templateUrl: './auth-input.html',
})
export class AuthInput {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'date'>('text');
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
