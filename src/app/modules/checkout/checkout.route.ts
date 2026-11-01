import { Routes } from '@angular/router';

import { sesionGuard } from '../../shared/auth/sesion.guard';

// CHECKOUT_ROUTES — páginas: checkout (HU-B-007) · checkout-exito (llega con el pago, HU-B-008)
export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
];
