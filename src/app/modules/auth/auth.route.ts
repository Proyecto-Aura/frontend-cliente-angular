import { Routes } from '@angular/router';

import { AuthRegistroStore } from './services/auth-registro-store';

// AUTH_ROUTES — hijos de auth-layout. Falta auth-recuperar (HU-B-003).
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth-login/auth-login').then((m) => m.AuthLogin),
      },
      {
        // HU-B-002. Estado compartido entre los pasos: vive mientras se está en el flujo.
        path: 'registro',
        providers: [AuthRegistroStore],
        children: [
          {
            path: 'documento',
            loadComponent: () =>
              import('./pages/auth-registro-documento/auth-registro-documento').then(
                (m) => m.AuthRegistroDocumento,
              ),
          },
          {
            path: 'datos',
            loadComponent: () =>
              import('./pages/auth-registro-datos/auth-registro-datos').then(
                (m) => m.AuthRegistroDatos,
              ),
          },
          { path: '', redirectTo: 'documento', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
