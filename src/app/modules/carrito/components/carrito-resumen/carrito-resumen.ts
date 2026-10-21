import { Component, computed, inject, output } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { CarritoStore } from '../../services/carrito-store';

/**
 * Totales del carrito y sus acciones. Es un estimado con los precios vigentes:
 * el monto final (precio mayorista incluido) lo calcula el sistema al
 * confirmar el pedido (HU-B-007), por eso "Finalizar compra" aún no se activa.
 */
@Component({
  selector: 'app-carrito-resumen',
  imports: [Icon],
  host: { class: 'flex flex-col gap-2 border-t border-[#f0f0f0] px-[18px] pt-3.5 pb-[18px]' },
  templateUrl: './carrito-resumen.html',
})
export class CarritoResumen {
  protected readonly carrito = inject(CarritoStore);
  readonly seguirComprando = output<void>();

  protected readonly precio = formatearPrecio;
  protected readonly etiquetaSubtotal = computed(() => {
    const n = this.carrito.unidades();
    return `Subtotal (${n} ${n === 1 ? 'producto' : 'productos'})`;
  });
}
