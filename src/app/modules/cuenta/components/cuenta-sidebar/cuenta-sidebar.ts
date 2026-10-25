import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { AuthApi } from '../../../auth/services/auth-api';
import { PerfilStore } from '../../services/perfil-store';

/**
 * Barra lateral de "Mi cuenta" (prototipo): quién inició sesión, el menú de
 * la cuenta y "Cerrar sesión" (HU-B-004). Pedidos y solicitudes llegan con
 * sus HU.
 */
@Component({
  selector: 'app-cuenta-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  host: {
    class:
      'flex max-w-[260px] flex-[1_1_230px] flex-col border-r border-[#f6e1e1] bg-[#fff5f5] px-3.5 py-[18px]',
  },
  templateUrl: './cuenta-sidebar.html',
})
export class CuentaSidebar {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  protected readonly perfil = inject(PerfilStore);

  protected readonly cerrando = signal(false);

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.api.cerrarSesion().subscribe(() => {
      void this.router.navigate(['/auth/login'], { replaceUrl: true });
    });
  }
}
