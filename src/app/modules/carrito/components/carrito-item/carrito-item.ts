import { Component, inject, input } from '@angular/core';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { CantidadStepper } from '../../../../shared/ui/cantidad-stepper/cantidad-stepper';
import { Icon } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { ItemCarrito } from '../../models/carrito.model';
import { CANTIDAD_MAXIMA, CarritoStore } from '../../services/carrito-store';

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
    this.carrito.eliminar(this.item().presentacionId);
    this.avisos.mostrar(`${this.item().nombre} eliminado`, 'Se quitó del carrito.');
  }
}
