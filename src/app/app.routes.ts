import { Routes } from '@angular/router';

// Cada módulo expone su `<m>.route.ts` con `export const <M>_ROUTES`.
// - `auth` y `mi-cuenta` traen su propio layout.
// - El resto (catálogo, carrito, checkout, nosotros, contacto) vive dentro de
//   `store-layout` (header + footer).
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.route').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'mi-cuenta',
    loadChildren: () => import('./modules/cuenta/cuenta.route').then((m) => m.CUENTA_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/store-layout/store-layout').then((m) => m.StoreLayout),
    children: [
      {
        path: 'catalogo',
        loadChildren: () =>
          import('./modules/catalogo/catalogo.route').then((m) => m.CATALOGO_ROUTES),
      },
      {
        path: 'carrito',
        loadChildren: () =>
          import('./modules/carrito/carrito.route').then((m) => m.CARRITO_ROUTES),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./modules/checkout/checkout.route').then((m) => m.CHECKOUT_ROUTES),
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
  { path: '**', redirectTo: '' },
];
