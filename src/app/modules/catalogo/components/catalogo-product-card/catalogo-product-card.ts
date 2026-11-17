import { Component, computed, input, output, signal } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { ProductoCatalogo } from '../../models/catalogo.model';
import {
  etiquetaPromocion,
  formatearPrecio,
  presentacionInicial,
} from '../../utils/catalogo.utils';
import { CatalogoPresentacionChips } from '../catalogo-presentacion-chips/catalogo-presentacion-chips';

/**
 * Tarjeta de un producto del catálogo (HU-B-005, prototipo). La presentación
 * elegida cambia imagen, precio y promoción. "Agregar" abre la ventana para
 * elegir presentación y cantidad (HU-B-006).
 */
@Component({
  selector: 'app-catalogo-product-card',
  imports: [Icon, CatalogoPresentacionChips],
  host: {
    class:
      'relative flex flex-col overflow-hidden rounded-[10px] border border-[#ececec] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,33,33,0.10)]',
  },
  templateUrl: './catalogo-product-card.html',
})
export class CatalogoProductCard {
  readonly producto = input.required<ProductoCatalogo>();
  readonly verDetalle = output<number>();
  /** Pide agregar al carrito, partiendo de la presentación elegida. */
  readonly agregar = output<number>();

  /** Elegida por el cliente; si no eligió, la primera con stock. */
  private readonly elegida = signal<number | null>(null);
  private readonly indice = computed(
    () => this.elegida() ?? presentacionInicial(this.producto().presentaciones),
  );
  protected readonly actual = computed(() => this.producto().presentaciones[this.indice()]);
  protected readonly hayStock = computed(() =>
    this.producto().presentaciones.some((p) => p.disponible),
  );
  /** "Desde" en la primera presentación, como en el prototipo. */
  protected readonly etiquetaPrecio = computed(() => (this.indice() === 0 ? 'Desde' : 'Precio'));

  protected readonly precio = formatearPrecio;
  protected readonly promo = etiquetaPromocion;

  protected elegir(indice: number): void {
    this.elegida.set(indice);
  }
}
