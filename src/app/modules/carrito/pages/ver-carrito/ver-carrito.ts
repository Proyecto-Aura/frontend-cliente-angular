import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarritoStore } from '../../services/carrito-store';
import { CarritoItem } from '../../components/carrito-item/carrito-item';
import { CarritoResumen } from '../../components/carrito-resumen/carrito-resumen';

/** Página del carrito: lista de items + resumen, o estado vacío. Hija de store-layout. */
@Component({
  selector: 'app-ver-carrito',
  imports: [RouterLink, CarritoItem, CarritoResumen],
  host: { class: 'mx-auto block w-full max-w-[900px] flex-1 px-6 py-8 lg:px-12' },
  template: `
    <h1 class="mb-6 font-display text-[28px] font-black tracking-[-0.5px] text-ink sm:text-[32px]">
      Tu carrito
    </h1>

    @if (carrito.items().length === 0) {
      <div
        class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#f0f0f0] bg-surface px-6 py-20 text-center"
      >
        <span class="flex size-16 items-center justify-center rounded-full bg-[#f0f0f0]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
        </span>
        <div>
          <p class="font-display text-[15px] font-semibold text-label">Tu carrito está vacío</p>
          <p class="mt-1 text-[12px] text-muted">Agrega productos del catálogo para comenzar</p>
        </div>
        <a
          routerLink="/catalogo"
          class="flex h-[36px] items-center rounded-lg bg-brand-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Ver catálogo
        </a>
      </div>
    } @else {
      <div class="flex flex-col items-start gap-6 lg:flex-row">
        <div class="flex w-full flex-1 flex-col gap-3">
          @for (entry of carrito.items(); track entry.product.id) {
            <app-carrito-item [entry]="entry" />
          }
        </div>
        <app-carrito-resumen />
      </div>
    }
  `,
})
export class VerCarrito {
  protected readonly carrito = inject(CarritoStore);
}
