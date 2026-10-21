import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CuentaSidebar } from '../../components/cuenta-sidebar/cuenta-sidebar';

/** Layout de "Mi cuenta": barra lateral a la izquierda y la página activa. */
@Component({
  selector: 'app-cuenta-layout',
  imports: [RouterOutlet, CuentaSidebar],
  host: { class: 'block min-h-screen bg-surface' },
  templateUrl: './cuenta-layout.html',
})
export class CuentaLayout {}
