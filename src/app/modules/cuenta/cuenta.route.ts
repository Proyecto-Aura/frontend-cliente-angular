import { Routes } from '@angular/router';

import { sesionGuard } from '../../shared/auth/sesion.guard';

// CUENTA_ROUTES — hijos de cuenta-layout (header + cuenta-sidebar):
// cuenta-perfil (HU-B-015) · cuenta-pedidos · cuenta-solicitudes (llegan con sus HU)
export const CUENTA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [sesionGuard],
    loadComponent: () => import('./layout/cuenta-layout/cuenta-layout').then((m) => m.CuentaLayout),
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/cuenta-perfil/cuenta-perfil').then((m) => m.CuentaPerfil),
      },
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
    ],
  },
];
