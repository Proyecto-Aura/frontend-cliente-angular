import { Routes } from '@angular/router';

import { authGuard } from '../../shared/auth/auth-guard';

// CUENTA_ROUTES — montado en '/mi-cuenta'. cuenta-layout (header + sidebar)
// envuelve las secciones: perfil, pedidos y solicitudes. Requiere sesión.
export const CUENTA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/cuenta-layout/cuenta-layout').then((m) => m.CuentaLayout),
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/cuenta-perfil/cuenta-perfil').then((m) => m.CuentaPerfil),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/cuenta-pedidos/cuenta-pedidos').then((m) => m.CuentaPedidos),
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./pages/cuenta-solicitudes/cuenta-solicitudes').then((m) => m.CuentaSolicitudes),
      },
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: '**', redirectTo: 'perfil' },
    ],
  },
];
