import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { CantidadStepper } from '../../../../shared/ui/cantidad-stepper/cantidad-stepper';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ProductoCatalogo } from '../../../catalogo/models/catalogo.model';
import {
  etiquetaPresentacion,
  etiquetaPromocion,
  formatearPrecio,
  presentacionInicial,
} from '../../../catalogo/utils/catalogo.utils';
import { CANTIDAD_MAXIMA, CarritoStore } from '../../services/carrito-store';

/**
 * Ventana rápida "Agregar" de la tarjeta del catálogo (HU-B-006, RF-B18):
 * elegir presentación —las agotadas no se pueden elegir— y cantidad.
 */
@Component({
  selector: 'app-carrito-agregar',
  imports: [Icon, CantidadStepper],
  host: {
    class: 'fixed inset-0 z-[52] flex items-center justify-center bg-[rgba(33,33,33,0.45)] p-5',
    '(click)': 'alClicFuera($event)',
    '(document:keydown.escape)': 'cerrar.emit()',
  },
  templateUrl: './carrito-agregar.html',
})
export class CarritoAgregar {
  private readonly carrito = inject(CarritoStore);
  private readonly avisos = inject(Avisos);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly producto = input.required<ProductoCatalogo>();
  /** La presentación que estaba elegida en la tarjeta. */
  readonly presentacionId = input<number | null>(null);
  readonly cerrar = output<void>();

  private readonly elegida = signal<number | null>(null);
  protected readonly actual = computed(() => {
    const presentaciones = this.producto().presentaciones;
    const id = this.elegida() ?? this.presentacionId();
    const pedida = presentaciones.find((p) => p.id === id && p.disponible);
    return pedida ?? presentaciones[presentacionInicial(presentaciones)];
  });
  protected readonly cantidad = signal(1);
  protected readonly maximo = CANTIDAD_MAXIMA;

  protected readonly etiqueta = etiquetaPresentacion;
  protected readonly promo = etiquetaPromocion;
  protected readonly precio = formatearPrecio;

  protected elegir(id: number): void {
    this.elegida.set(id);
  }

  protected agregar(): void {
    const presentacion = this.actual();
    const cantidad = this.cantidad();
    if (!this.carrito.agregar(this.producto(), presentacion, cantidad)) return;
    this.avisos.mostrar(
      `${this.producto().nombre} agregado`,
      `${cantidad} × ${this.etiqueta(presentacion)} · ${this.precio(presentacion.precio_final * cantidad)}`,
    );
    this.cerrar.emit();
  }

  protected alClicFuera(event: MouseEvent): void {
    if (event.target === this.host.nativeElement) this.cerrar.emit();
  }
}
