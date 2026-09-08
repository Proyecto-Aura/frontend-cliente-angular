import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../../../shared/ui/header/header';
import { CuentaSidebar } from '../../components/cuenta-sidebar/cuenta-sidebar';

/** Shell de "Mi cuenta": header + sidebar de cuenta + contenido. Sin footer. */
@Component({
  selector: 'app-cuenta-layout',
  imports: [RouterOutlet, Header, CuentaSidebar],
  host: { class: 'flex min-h-screen flex-col bg-canvas' },
  template: `
    <app-header />
    <div class="flex flex-1 flex-col lg:flex-row">
      <app-cuenta-sidebar />
      <main class="flex-1 px-6 py-8 lg:px-10">
        <router-outlet />
      </main>
    </div>
  `,
})
export class CuentaLayout {}
