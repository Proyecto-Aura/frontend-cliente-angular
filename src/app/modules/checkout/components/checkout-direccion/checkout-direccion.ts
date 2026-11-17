import { Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Icon } from '../../../../shared/ui/icon/icon';
import {
  DIRECCION_MAXIMA,
  REFERENCIA_MAXIMA,
  componerDireccion,
  errorDeDireccion,
} from '../../utils/checkout.utils';

/**
 * "Dirección de entrega" del checkout (HU-B-007, RF-B20/RF-B21): trae la
 * dirección predeterminada del perfil, el cliente la corrobora y la confirma;
 * si quiere cambiarla, "Deshacer" cancela la confirmación y vuelve a editarla.
 * La llamada al servidor la hace la página: aquí solo se arma y valida el texto.
 */
@Component({
  selector: 'app-checkout-direccion',
  imports: [ReactiveFormsModule, Icon],
  host: { class: 'block rounded-xl border border-[#ececec] bg-white px-5 py-[18px]' },
  templateUrl: './checkout-direccion.html',
})
export class CheckoutDireccion {
  /** Dirección guardada en el perfil: se propone como predeterminada. */
  readonly direccionPerfil = input<string | null>(null);
  readonly confirmada = input(false);
  /** Mientras el servidor valida la dirección. */
  readonly confirmando = input(false);
  /** Motivo por el que el servidor no aceptó la dirección. */
  readonly errorServidor = input<string | null>(null);

  /** La dirección lista para el pedido ("Av. X 123 · Ref: frente al parque"). */
  readonly confirmar = output<string>();
  readonly deshacer = output<void>();

  protected readonly form = new FormGroup({
    direccion: new FormControl('', { nonNullable: true }),
    referencia: new FormControl('', { nonNullable: true }),
  });
  protected readonly error = signal<string | null>(null);
  protected readonly maxDireccion = DIRECCION_MAXIMA;
  protected readonly maxReferencia = REFERENCIA_MAXIMA;

  constructor() {
    // Propone la del perfil, salvo que el cliente ya haya escrito la suya.
    effect(() => {
      const perfil = this.direccionPerfil();
      const control = this.form.controls.direccion;
      if (perfil && !control.dirty) control.setValue(perfil);
    });
    effect(() => {
      if (this.confirmada() || this.confirmando()) this.form.disable({ emitEvent: false });
      else this.form.enable({ emitEvent: false });
    });
  }

  protected enviar(): void {
    if (this.confirmada() || this.confirmando()) return;
    const { direccion, referencia } = this.form.getRawValue();
    const error = errorDeDireccion(direccion, referencia);
    this.error.set(error);
    if (!error) this.confirmar.emit(componerDireccion(direccion, referencia));
  }
}
