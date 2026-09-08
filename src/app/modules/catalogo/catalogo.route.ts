import { Routes } from '@angular/router';

// CATALOGO_ROUTES — montado en '/catalogo' dentro de store-layout.
export const CATALOGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listar-productos/listar-productos').then((m) => m.ListarProductos),
  },
];
