import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from '../../shared/ui/footer/footer';
import { Header } from '../../shared/ui/header/header';

/** Layout de la tienda: header, la página activa y footer. */
@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, Header, Footer],
  host: { class: 'flex min-h-screen flex-col bg-surface' },
  templateUrl: './store-layout.html',
})
export class StoreLayout {}
