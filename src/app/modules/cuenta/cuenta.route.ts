import { Routes } from '@angular/router';

// CUENTA_ROUTES — montado en '/mi-cuenta'. cuenta-layout (header + sidebar)
// envuelve las secciones. perfil y solicitudes llegan en feature/Perfil-y-solicitudes.
export const CUENTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/cuenta-layout/cuenta-layout').then((m) => m.CuentaLayout),
    children: [
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/cuenta-pedidos/cuenta-pedidos').then((m) => m.CuentaPedidos),
      },
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      { path: '**', redirectTo: 'pedidos' },
    ],
  },
];
