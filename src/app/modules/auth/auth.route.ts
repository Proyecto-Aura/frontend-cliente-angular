import { Routes } from '@angular/router';

// AUTH_ROUTES — hijos de auth-layout. Se completan al implementar las páginas:
// auth-login · auth-recuperar · auth-registro-documento · auth-registro-datos
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth-login/auth-login').then((m) => m.AuthLogin),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
