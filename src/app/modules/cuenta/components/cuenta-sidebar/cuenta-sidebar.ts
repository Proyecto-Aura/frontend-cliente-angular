import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

/** Menú lateral de "Mi cuenta": datos del usuario, navegación y cerrar sesión. */
@Component({
  selector: 'app-cuenta-sidebar',
  imports: [RouterLink, RouterLinkActive],
  host: {
    class:
      'flex w-full shrink-0 flex-col gap-6 border-b border-[#fde8e8] bg-[#fef2f2] p-5 lg:w-[260px] lg:border-b-0 lg:border-r',
  },
  templateUrl: './cuenta-sidebar.html',
})
export class CuentaSidebar {
  private readonly router = inject(Router);

  protected readonly items = [
    { path: '/mi-cuenta/perfil', label: 'Mi Perfil' },
    { path: '/mi-cuenta/pedidos', label: 'Mis Pedidos' },
    { path: '/mi-cuenta/solicitudes', label: 'Mis Solicitudes' },
  ];

  // TODO: usuario real desde shared/auth cuando haya sesión con perfil.
  protected cerrarSesion(): void {
    this.router.navigate(['/auth/login']);
  }
}
