import { Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { CarritoStore } from '../../services/carrito-store';

/**
 * Totales del carrito y sus acciones. Es un estimado con los precios vigentes:
 * el monto final (precio mayorista incluido) lo calcula el sistema al
 * confirmar el pedido en el checkout (HU-B-007), a donde lleva "Finalizar compra".
 */
@Component({
  selector: 'app-carrito-resumen',
  imports: [Icon],
  host: { class: 'flex flex-col gap-2 border-t border-[#f0f0f0] px-[18px] pt-3.5 pb-[18px]' },
  templateUrl: './carrito-resumen.html',
})
export class CarritoResumen {
  protected readonly carrito = inject(CarritoStore);
  private readonly router = inject(Router);
  readonly seguirComprando = output<void>();

  protected readonly precio = formatearPrecio;
  protected readonly etiquetaSubtotal = computed(() => {
    const n = this.carrito.unidades();
    return `Subtotal (${n} ${n === 1 ? 'producto' : 'productos'})`;
  });

  /** "Finalizar compra": cierra el panel y pasa a confirmar el pedido. */
  protected finalizar(): void {
    this.carrito.abierto.set(false);
    void this.router.navigate(['/checkout']);
  }
}
