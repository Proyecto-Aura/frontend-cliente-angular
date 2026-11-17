import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { CarritoStore } from '../../services/carrito-store';
import { CarritoItem } from '../carrito-item/carrito-item';
import { CarritoResumen } from '../carrito-resumen/carrito-resumen';

/**
 * Panel lateral "Tu carrito" (HU-B-006, prototipo). Al abrirse refresca
 * precio, promoción y stock de lo guardado.
 */
@Component({
  selector: 'app-carrito-drawer',
  imports: [Icon, CarritoItem, CarritoResumen],
  host: { class: 'fixed inset-0 z-[55]', '(document:keydown.escape)': 'cerrar()' },
  templateUrl: './carrito-drawer.html',
})
export class CarritoDrawer {
  protected readonly carrito = inject(CarritoStore);
  private readonly router = inject(Router);

  constructor() {
    this.carrito
      .refrescar()
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe();
  }

  protected cerrar(): void {
    this.carrito.abierto.set(false);
  }

  /** "Seguir comprando" / "Ver catálogo": cierra y lleva al catálogo si no está ahí. */
  protected alCatalogo(): void {
    this.cerrar();
    if (!this.router.url.startsWith('/catalogo')) void this.router.navigate(['/catalogo']);
  }
}
