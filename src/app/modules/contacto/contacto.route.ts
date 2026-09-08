import { Routes } from '@angular/router';

// CONTACTO_ROUTES — montado en '/contacto' dentro de store-layout.
export const CONTACTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/contacto').then((m) => m.Contacto),
  },
];
