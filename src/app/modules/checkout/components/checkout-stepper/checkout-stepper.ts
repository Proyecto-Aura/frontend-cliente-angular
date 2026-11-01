import { Component, input } from '@angular/core';

export type PasoCheckout = 1 | 2 | 3;

const ETIQUETAS = ['Carrito', 'Datos de entrega', 'Pago'];

/** Pasos de la compra: Carrito → Datos de entrega → Pago (prototipo). */
@Component({
  selector: 'app-checkout-stepper',
  host: { class: 'block' },
  templateUrl: './checkout-stepper.html',
})
export class CheckoutStepper {
  /** Paso en el que está el cliente; los anteriores y el actual se pintan de rojo. */
  readonly paso = input.required<PasoCheckout>();

  protected readonly pasos = ETIQUETAS.map((etiqueta, i) => ({ numero: i + 1, etiqueta }));
}
