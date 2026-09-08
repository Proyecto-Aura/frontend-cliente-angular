import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';

import { Producto } from '../../models/producto.model';
import { CarritoStore } from '../../../carrito/services/carrito-store';
import { ToastService } from '../../../../shared/ui/toast/toast-service';
import { CatalogoStockBadge } from '../catalogo-stock-badge/catalogo-stock-badge';

/** Modal de detalle de producto: imagen grande, datos, selector de cantidad y añadir al carrito. */
@Component({
  selector: 'app-catalogo-product-detail',
  imports: [NgOptimizedImage, DecimalPipe, CatalogoStockBadge],
  host: { class: 'block' },
  templateUrl: './catalogo-product-detail.html',
})
export class CatalogoProductDetail {
  readonly product = input.required<Producto>();
  readonly close = output<void>();

  private readonly carrito = inject(CarritoStore);
  private readonly toast = inject(ToastService);

  protected readonly qty = signal(1);

  protected readonly enCarrito = computed(() => this.carrito.getQty(this.product().id));
  protected readonly stockLibre = computed(() => this.product().stock - this.enCarrito());
  protected readonly total = computed(() => this.product().price * this.qty());

  protected menos(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }

  protected mas(): void {
    this.qty.update((q) => Math.min(Math.max(this.stockLibre(), 1), q + 1));
  }

  protected agregar(): void {
    const p = this.product();
    const libre = this.stockLibre();

    if (!p.available || libre <= 0) {
      this.toast.error(
        'Producto sin stock disponible',
        'Este producto no está disponible en este momento.',
      );
      return;
    }
    if (this.qty() > libre) {
      const enCarrito = this.enCarrito();
      this.toast.warning(
        'Stock insuficiente',
        `Solo quedan ${libre} unidad${libre === 1 ? '' : 'es'} disponibles${
          enCarrito > 0 ? ` (${enCarrito} ya en tu carrito)` : ''
        }.`,
      );
      return;
    }

    this.carrito.addItem(p, this.qty());
    this.toast.success(
      `${p.name} agregado`,
      `${this.qty()} unidad${this.qty() === 1 ? '' : 'es'} · ${p.weight} · S/ ${this.total().toFixed(2)}`,
    );
    this.close.emit();
  }
}
