import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

// Esqueleto de rutas. Cada módulo expone su `<m>.route.ts` con `export const <M>_ROUTES`.
// Todo menos `auth` va envuelto en `layouts/store-layout` (header + footer); `cuenta`
// agrega dentro su `cuenta-layout` (cuenta-sidebar).
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.route').then((m) => m.AUTH_ROUTES),
  },
  {
    // Enlace del correo de recuperación (lo arma el backend): /reset-password?token=…
    path: 'reset-password',
    // Una redirección simple descartaría el ?token=; se pasa tal cual.
    redirectTo: ({ queryParams }) =>
      inject(Router).createUrlTree(['/auth/restablecer'], { queryParams }),
  },
  {
    // Enlace del correo de verificación (lo arma el backend): /verify-email?token=…
    path: 'verify-email',
    redirectTo: ({ queryParams }) =>
      inject(Router).createUrlTree(['/auth/verificar-correo'], { queryParams }),
  },
  {
    path: '',
    loadComponent: () => import('./layouts/store-layout/store-layout').then((m) => m.StoreLayout),
    children: [
      {
        path: 'catalogo',
        loadChildren: () =>
          import('./modules/catalogo/catalogo.route').then((m) => m.CATALOGO_ROUTES),
      },
      {
        path: 'carrito',
        loadChildren: () => import('./modules/carrito/carrito.route').then((m) => m.CARRITO_ROUTES),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./modules/checkout/checkout.route').then((m) => m.CHECKOUT_ROUTES),
      },
      {
        path: 'mi-cuenta',
        loadChildren: () => import('./modules/cuenta/cuenta.route').then((m) => m.CUENTA_ROUTES),
      },
      {
        path: 'nosotros',
        loadChildren: () =>
          import('./modules/nosotros/nosotros.route').then((m) => m.NOSOTROS_ROUTES),
      },
      {
        path: 'contacto',
        loadChildren: () =>
          import('./modules/contacto/contacto.route').then((m) => m.CONTACTO_ROUTES),
      },
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'catalogo' },
];
