import { Component, computed, inject, signal } from '@angular/core';

import { ToastService } from '../../../../shared/ui/toast/toast-service';
import { UiButton, UiCard, UiInput } from '../../../../shared/ui';

/** Cambiar contraseña. Sin backend: solo valida en el cliente. */
@Component({
  selector: 'app-cuenta-password-card',
  imports: [UiButton, UiCard, UiInput],
  host: { class: 'block' },
  templateUrl: './cuenta-password-card.html',
})
export class CuentaPasswordCard {
  private readonly toast = inject(ToastService);

  protected readonly actual = signal('');
  protected readonly nueva = signal('');
  protected readonly confirmar = signal('');
  protected readonly guardado = signal(false);

  protected readonly noCoincide = computed(
    () => this.confirmar() !== '' && this.nueva() !== this.confirmar(),
  );
  protected readonly puedeEnviar = computed(
    () =>
      this.actual().trim() !== '' &&
      this.nueva().trim().length >= 8 &&
      this.nueva() === this.confirmar(),
  );

  protected enviar(): void {
    if (!this.puedeEnviar()) return;
    this.guardado.set(true);
    this.toast.success('Contraseña actualizada', 'Tu contraseña fue cambiada correctamente.');
    this.actual.set('');
    this.nueva.set('');
    this.confirmar.set('');
    setTimeout(() => this.guardado.set(false), 2000);
  }
}
