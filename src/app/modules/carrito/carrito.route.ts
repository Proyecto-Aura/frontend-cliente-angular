import { Routes } from '@angular/router';

// CARRITO_ROUTES — montado en '/carrito' dentro de store-layout.
export const CARRITO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ver-carrito/ver-carrito').then((m) => m.VerCarrito),
  },
];
