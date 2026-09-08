import { Component, inject, input, output, signal } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';

import { Producto } from '../../models/producto.model';
import { CarritoStore } from '../../../carrito/services/carrito-store';
import { ToastService } from '../../../../shared/ui/toast/toast-service';

/** Tarjeta de producto del catálogo: imagen, datos, precio y acciones. */
@Component({
  selector: 'app-catalogo-product-card',
  imports: [NgOptimizedImage, DecimalPipe],
  host: { class: 'block' },
  templateUrl: './catalogo-product-card.html',
})
export class CatalogoProductCard {
  readonly product = input.required<Producto>();
  readonly detail = output<Producto>();

  private readonly carrito = inject(CarritoStore);
  private readonly toast = inject(ToastService);

  protected readonly agregado = signal(false);

  protected agregar(): void {
    const p = this.product();
    if (!p.available) return;

    if (this.carrito.getQty(p.id) >= p.stock) {
      this.toast.warning(
        'Stock insuficiente',
        `Ya tienes ${this.carrito.getQty(p.id)} en tu carrito, es todo lo disponible.`,
      );
      return;
    }

    this.carrito.addItem(p);
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 1500);
  }
}
