import { Component, computed, inject, signal } from '@angular/core';

import { ToastService } from '../../../../shared/ui/toast/toast-service';
import { UiAlert, UiButton, UiCard, UiInput } from '../../../../shared/ui';

/**
 * Cambiar y verificar el correo (2 pasos: pedir código → verificar).
 * Sin backend: el envío y la validación del código están simulados.
 */
@Component({
  selector: 'app-cuenta-email-card',
  imports: [UiAlert, UiButton, UiCard, UiInput],
  host: { class: 'block' },
  templateUrl: './cuenta-email-card.html',
})
export class CuentaEmailCard {
  private readonly toast = inject(ToastService);

  // TODO: correo real desde shared/auth cuando haya sesión con perfil.
  protected readonly currentEmail = signal('franco@gmail.com');
  protected readonly nuevoEmail = signal('');
  protected readonly codigo = signal('');
  protected readonly step = signal<'form' | 'codigo'>('form');

  protected readonly emailValido = computed(() => /\S+@\S+\.\S+/.test(this.nuevoEmail()));
  protected readonly canSendCode = computed(
    () => this.emailValido() && this.nuevoEmail() !== this.currentEmail(),
  );
  protected readonly canVerify = computed(() => this.codigo().trim().length === 6);

  protected onCodigo(value: string): void {
    this.codigo.set(value.replace(/\D/g, '').slice(0, 6));
  }

  protected enviarCodigo(): void {
    if (!this.canSendCode()) return;
    this.step.set('codigo');
    this.toast.success('Código enviado', `Revisa la bandeja de ${this.nuevoEmail()} (simulado).`);
  }

  protected verificar(): void {
    if (!this.canVerify()) return;
    this.currentEmail.set(this.nuevoEmail());
    this.nuevoEmail.set('');
    this.codigo.set('');
    this.step.set('form');
    this.toast.success('Correo verificado', 'Tu correo electrónico fue actualizado correctamente.');
  }

  protected cambiarCorreo(): void {
    this.step.set('form');
    this.codigo.set('');
  }
}
