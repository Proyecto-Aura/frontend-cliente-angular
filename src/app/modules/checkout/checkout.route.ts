import { Routes } from '@angular/router';

import { sesionGuard } from '../../shared/auth/sesion.guard';

// CHECKOUT_ROUTES — páginas: checkout (HU-B-007 y pago, HU-B-008) · checkout-exito (pedido pagado, HU-B-008)
export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'exito',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./pages/checkout-exito/checkout-exito').then((m) => m.CheckoutExito),
  },
];
