import { Routes } from '@angular/router';

import { guestGuard } from '../../shared/auth/guest-guard';
import { AuthRegistroStore } from './services/auth-registro-store';

// AUTH_ROUTES — hijos de auth-layout. Se completan al implementar las páginas:
// auth-login · auth-recuperar · auth-registro-documento · auth-registro-datos
// Con sesión activa, guestGuard redirige lejos de estas pantallas.
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth-login/auth-login').then((m) => m.AuthLogin),
      },
      {
        path: 'registro',
        // Estado compartido entre los pasos: vive mientras se está en el flujo.
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
