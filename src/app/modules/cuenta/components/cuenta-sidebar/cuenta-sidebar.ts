import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthApi } from '../../../auth/services/auth-api';

/**
 * Barra lateral de "Mi cuenta". Por ahora solo "Cerrar sesión" (HU-B-004);
 * perfil, pedidos y solicitudes llegan con sus HU.
 */
@Component({
  selector: 'app-cuenta-sidebar',
  host: { class: 'block rounded-xl bg-[#fef1f1] px-6 pt-6 pb-8' },
  templateUrl: './cuenta-sidebar.html',
})
export class CuentaSidebar {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly cerrando = signal(false);

  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.api.cerrarSesion().subscribe(() => {
      void this.router.navigate(['/auth/login'], { replaceUrl: true });
    });
  }
}
