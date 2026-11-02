import { Component, computed, input, output } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { LineaPedido } from '../../models/checkout.model';

/**
 * "Resumen del pedido" del checkout (HU-B-007, RF-B22/RF-B23): las líneas, el
 * subtotal y el total que calculó el servidor, con el precio mayorista cuando
 * corresponde (RN17). Es lo que el cliente revisa antes de pagar (HU-B-008,
 * RF-B25): "Pagar" se activa con la dirección confirmada.
 */
@Component({
  selector: 'app-checkout-resumen',
  imports: [Icon],
  host: {
    class:
      'block min-w-0 max-w-full flex-[1_1_280px] rounded-xl border border-[#ececec] bg-white px-5 py-[18px] lg:sticky lg:top-[120px]',
  },
  templateUrl: './checkout-resumen.html',
})
export class CheckoutResumen {
  readonly lineas = input.required<LineaPedido[]>();
  readonly subtotal = input.required<number>();
  readonly total = input.required<number>();
  /** Con la dirección confirmada solo falta el pago. */
  readonly direccionConfirmada = input(false);
  readonly pagando = input(false);
  readonly pagar = output<void>();

  protected readonly precio = formatearPrecio;
  protected readonly etiquetaSubtotal = computed(() => {
    const unidades = this.lineas().reduce((n, l) => n + l.cantidad, 0);
    return `Subtotal (${unidades} ${unidades === 1 ? 'producto' : 'productos'})`;
  });
}
