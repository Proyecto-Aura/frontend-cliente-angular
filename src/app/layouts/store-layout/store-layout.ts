import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';

/**
 * Shell del storefront público: header + contenido + footer.
 * Envuelve catálogo, carrito, checkout, nosotros y contacto (ver app.routes.ts).
 */
@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, Header, Footer],
  host: { class: 'flex min-h-screen flex-col bg-canvas' },
  templateUrl: './store-layout.html',
})
export class StoreLayout {}
