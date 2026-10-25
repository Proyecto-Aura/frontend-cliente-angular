import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { Icon } from '../../../../shared/ui/icon/icon';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { CatalogoApi } from '../../services/catalogo-api';
import {
  etiquetaPresentacion,
  etiquetaPromocion,
  formatearDia,
  formatearPrecio,
  presentacionInicial,
} from '../../utils/catalogo.utils';
import { CatalogoPresentacionChips } from '../catalogo-presentacion-chips/catalogo-presentacion-chips';

/**
 * Modal "Ver detalle" de un producto (HU-B-005, RF-B17): presentaciones
 * disponibles, precios y promociones vigentes. "Agregar al carrito" queda
 * deshabilitado hasta la HU-B-006.
 */
@Component({
  selector: 'app-catalogo-product-detail',
  imports: [Icon, CatalogoPresentacionChips],
  host: {
    class: 'fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,33,33,0.45)] p-4',
    '(click)': 'alClicFuera($event)',
    '(document:keydown.escape)': 'cerrar.emit()',
  },
  templateUrl: './catalogo-product-detail.html',
})
export class CatalogoProductDetail {
  private readonly api = inject(CatalogoApi);

  readonly productoId = input.required<number>();
  readonly cerrar = output<void>();

  protected readonly producto = rxResource({
    params: () => this.productoId(),
    stream: ({ params: id }) => this.api.obtener(id),
  });
  protected readonly mensajeError = computed(() =>
    apiErrorMessage(this.producto.error(), 'No pudimos cargar el producto. Inténtalo de nuevo.'),
  );

  /** Elegida por el cliente; si no eligió, la primera con stock. */
  private readonly elegida = signal<number | null>(null);
  protected readonly actual = computed(() => {
    if (!this.producto.hasValue()) return null;
    const presentaciones = this.producto.value().presentaciones;
    return presentaciones[this.elegida() ?? presentacionInicial(presentaciones)] ?? null;
  });

  protected readonly precio = formatearPrecio;
  protected readonly etiqueta = etiquetaPresentacion;
  protected readonly promo = etiquetaPromocion;
  protected readonly dia = formatearDia;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Un clic en el fondo oscuro (fuera de la ventana) cierra el modal. */
  protected alClicFuera(event: MouseEvent): void {
    if (event.target === this.host.nativeElement) this.cerrar.emit();
  }

  protected elegir(indice: number): void {
    this.elegida.set(indice);
  }
}
