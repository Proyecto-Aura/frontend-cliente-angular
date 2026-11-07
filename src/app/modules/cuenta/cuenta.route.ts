import { Routes } from '@angular/router';

import { sesionGuard } from '../../shared/auth/sesion.guard';
import { CUENTA_PREVIEW_ROUTES } from './testing/cuenta-preview.routes';

// CUENTA_ROUTES — hijos de cuenta-layout (header + cuenta-sidebar):
// cuenta-perfil (HU-B-015) · cuenta-solicitudes (HU-B-014).
export const CUENTA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [sesionGuard],
    loadComponent: () => import('./layout/cuenta-layout/cuenta-layout').then((m) => m.CuentaLayout),
    children: [
      // Vista de comprobación aislada: no se publica en producción ni figura en el menú.
      ...CUENTA_PREVIEW_ROUTES,
      {
        path: 'pedidos',
        canActivate: [sesionGuard],
        loadComponent: () =>
          import('./pages/cuenta-pedidos/cuenta-pedidos').then((m) => m.CuentaPedidos),
      },
      {
        path: 'solicitudes',
        canActivate: [sesionGuard],
        loadComponent: () =>
          import('./pages/cuenta-solicitudes-portal/cuenta-solicitudes-portal').then(
            (m) => m.CuentaSolicitudesPortal,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/cuenta-perfil/cuenta-perfil').then((m) => m.CuentaPerfil),
      },
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
    ],
  },
];
