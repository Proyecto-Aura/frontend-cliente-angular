import { Routes } from '@angular/router';

// NOSOTROS_ROUTES — montado en '/nosotros' dentro de store-layout.
export const NOSOTROS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/nosotros').then((m) => m.Nosotros),
  },
];
