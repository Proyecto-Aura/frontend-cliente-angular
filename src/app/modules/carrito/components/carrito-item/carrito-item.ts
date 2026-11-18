import { Component, inject, input } from '@angular/core';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { CantidadStepper } from '../../../../shared/ui/cantidad-stepper/cantidad-stepper';
import { Icon } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { ItemCarrito } from '../../models/carrito.model';
import { CANTIDAD_MAXIMA, CarritoStore } from '../../services/carrito-store';

/** El toast de "eliminado del carrito" es breve: no hace falta que dure lo normal. */
const DURACION_AVISO_CARRITO_MS = 3000;

/** Una línea del carrito: cambiar cantidad o eliminar (HU-B-006, RF-B19). */
@Component({
  selector: 'app-carrito-item',
  imports: [Icon, CantidadStepper],
  host: { class: 'relative flex gap-3 rounded-[10px] border border-[#ececec] p-3' },
  templateUrl: './carrito-item.html',
})
export class CarritoItem {
  private readonly carrito = inject(CarritoStore);
  private readonly avisos = inject(Avisos);

  readonly item = input.required<ItemCarrito>();

  protected readonly precio = formatearPrecio;
  protected readonly maximo = CANTIDAD_MAXIMA;

  protected cambiar(cantidad: number): void {
    this.carrito.cambiarCantidad(this.item().presentacionId, cantidad);
  }

  protected eliminar(): void {
    const item = this.item();
    this.carrito.eliminar(item.presentacionId);
    this.avisos.mostrar(
      'Producto eliminado',
      `${item.cantidad} ${item.nombre} · ${item.presentacion}`,
      'success',
      undefined,
      DURACION_AVISO_CARRITO_MS,
    );
  }
}
