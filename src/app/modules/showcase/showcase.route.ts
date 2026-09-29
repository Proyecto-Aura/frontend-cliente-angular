import { Routes } from '@angular/router';

// SHOWCASE_ROUTES — montado en '/showcase'. Catálogo vivo de las primitivas de shared/ui.
export const SHOWCASE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/showcase/showcase').then((m) => m.Showcase),
  },
];
