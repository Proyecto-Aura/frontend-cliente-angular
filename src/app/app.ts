import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Aviso } from './shared/ui/aviso/aviso';

/** Raíz de la app: solo el router y el toast, para que ande en cualquier layout. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Aviso],
  templateUrl: './app.html',
})
export class App {}
