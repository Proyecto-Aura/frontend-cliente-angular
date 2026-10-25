import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CuentaSidebar } from '../../components/cuenta-sidebar/cuenta-sidebar';
import { PerfilStore } from '../../services/perfil-store';

/** Layout de "Mi cuenta": barra lateral a la izquierda y la página activa. */
@Component({
  selector: 'app-cuenta-layout',
  imports: [RouterOutlet, CuentaSidebar],
  host: {
    class: 'flex min-h-[calc(100vh-64px)] flex-wrap items-stretch bg-[#fafafa]',
  },
  templateUrl: './cuenta-layout.html',
})
export class CuentaLayout {
  constructor() {
    // Nombre y tipo de la barra lateral; si falla, la barra sigue sin ellos.
    inject(PerfilStore)
      .cargar()
      .subscribe({ error: () => undefined });
  }
}
