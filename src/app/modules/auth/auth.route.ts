import { Routes } from '@angular/router';

// AUTH_ROUTES — hijos de auth-layout. Faltan auth-recuperar (HU-B-003) y
// auth-registro-documento · auth-registro-datos (HU-B-002).
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth-login/auth-login').then((m) => m.AuthLogin),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
