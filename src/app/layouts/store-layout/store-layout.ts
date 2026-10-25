import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CarritoDrawer } from '../../modules/carrito/components/carrito-drawer/carrito-drawer';
import { CarritoStore } from '../../modules/carrito/services/carrito-store';
import { Aviso } from '../../shared/ui/aviso/aviso';
import { Footer } from '../../shared/ui/footer/footer';
import { Header } from '../../shared/ui/header/header';

/** Layout de la tienda: header, la página activa, footer, el carrito y los avisos. */
@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, Header, Footer, CarritoDrawer, Aviso],
  host: { class: 'flex min-h-screen flex-col bg-surface' },
  templateUrl: './store-layout.html',
})
export class StoreLayout {
  protected readonly carrito = inject(CarritoStore);
}
