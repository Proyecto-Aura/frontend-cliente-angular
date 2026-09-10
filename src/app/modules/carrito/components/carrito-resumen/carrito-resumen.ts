import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CarritoStore } from '../../services/carrito-store';

/** Resumen del carrito: subtotal, envío, total y acciones (checkout / seguir comprando). */
@Component({
  selector: 'app-carrito-resumen',
  imports: [DecimalPipe, RouterLink],
  host: {
    class:
      'flex w-full shrink-0 flex-col gap-4 rounded-xl border border-[#f0f0f0] bg-surface p-5 lg:sticky lg:top-6 lg:w-[320px]',
  },
  templateUrl: './carrito-resumen.html',
})
export class CarritoResumen {
  protected readonly carrito = inject(CarritoStore);
}
