import { Component } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';

/**
 * "Método de pago" del checkout (HU-B-008, RF-B24): el único medio es el pago
 * en línea con Culqi, con tarjeta, Yape o Plin. El pago se inicia desde el
 * resumen del pedido, que es donde el cliente ve el total antes de pagar.
 */
@Component({
  selector: 'app-checkout-pago',
  imports: [Icon],
  host: { class: 'block rounded-xl border border-[#ececec] bg-white px-5 py-[18px]' },
  templateUrl: './checkout-pago.html',
})
export class CheckoutPago {
  protected readonly medios = ['Tarjeta', 'Yape', 'Plin'];
}
