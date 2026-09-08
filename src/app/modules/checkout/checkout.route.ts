import { Routes } from '@angular/router';

// CHECKOUT_ROUTES — montado en '/checkout' dentro de store-layout.
export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'exito',
    loadComponent: () =>
      import('./pages/checkout-exito/checkout-exito').then((m) => m.CheckoutExito),
  },
];
