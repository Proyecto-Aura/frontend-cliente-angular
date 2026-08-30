import { Routes } from '@angular/router';

// Base del módulo de autenticación. Las páginas se irán completando
// (auth-form-login, auth-form-register, auth-reset) sobre auth-layout.
export const AUTH_ROUTES: Routes = [
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('./layout/auth-layout/auth-layout').then((c) => c.AuthLayout),
  //   children: [
  //     {
  //       path: 'login',
  //       loadComponent: () =>
  //         import('./pages/auth-form-login/auth-form-login').then((c) => c.AuthFormLogin),
  //     },
  //     {
  //       path: 'register',
  //       loadComponent: () =>
  //         import('./pages/auth-form-register/auth-form-register').then((c) => c.AuthFormRegister),
  //     },
  //     {
  //       path: 'reset',
  //       loadComponent: () => import('./pages/auth-reset/auth-reset').then((c) => c.AuthReset),
  //     },
  //     { path: '', redirectTo: 'login', pathMatch: 'full' },
  //   ],
  // },
];
