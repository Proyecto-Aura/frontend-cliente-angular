import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../../../shared/ui/header/header';
import { CuentaSidebar } from '../../components/cuenta-sidebar/cuenta-sidebar';

/** Shell de "Mi cuenta": header + sidebar de cuenta + contenido. Sin footer. */
@Component({
  selector: 'app-cuenta-layout',
  imports: [RouterOutlet, Header, CuentaSidebar],
  host: { class: 'flex min-h-screen flex-col bg-canvas' },
  templateUrl: './cuenta-layout.html',
})
export class CuentaLayout {}
