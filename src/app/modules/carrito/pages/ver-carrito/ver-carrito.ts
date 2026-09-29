import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UiButton, UiCard } from '../../../../shared/ui';
import { CarritoStore } from '../../services/carrito-store';
import { CarritoItem } from '../../components/carrito-item/carrito-item';
import { CarritoResumen } from '../../components/carrito-resumen/carrito-resumen';

/** Página del carrito: lista de items + resumen, o estado vacío. Hija de store-layout. */
@Component({
  selector: 'app-ver-carrito',
  imports: [RouterLink, CarritoItem, CarritoResumen, UiButton, UiCard],
  host: { class: 'mx-auto block w-full max-w-[900px] flex-1 px-6 py-8 lg:px-12' },
  templateUrl: './ver-carrito.html',
})
export class VerCarrito {
  protected readonly carrito = inject(CarritoStore);
}
