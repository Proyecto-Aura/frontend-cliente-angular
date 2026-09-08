import { Component, inject, input } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';

import { ItemCarrito } from '../../models/item-carrito.model';
import { CarritoStore } from '../../services/carrito-store';

/** Fila de un producto en el carrito: imagen, datos, cantidad y subtotal. */
@Component({
  selector: 'app-carrito-item',
  imports: [NgOptimizedImage, DecimalPipe],
  host: { class: 'block' },
  templateUrl: './carrito-item.html',
})
export class CarritoItem {
  readonly entry = input.required<ItemCarrito>();

  protected readonly carrito = inject(CarritoStore);
}
