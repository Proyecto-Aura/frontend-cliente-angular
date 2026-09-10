import { Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Campo de formulario reutilizable para el módulo auth: etiqueta + input.
 * Recibe un `FormControl` ya creado por el formulario padre. Si `type` es
 * `password` añade el botón mostrar/ocultar.
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
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);

  protected readonly show = signal(false);
  protected readonly resolvedType = computed(() =>
    this.type() === 'password' ? (this.show() ? 'text' : 'password') : this.type(),
  );
}
