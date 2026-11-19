import { Routes } from '@angular/router';

// NOSOTROS_ROUTES — página única: nosotros
export const NOSOTROS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/nosotros').then((m) => m.Nosotros),
  },
];
