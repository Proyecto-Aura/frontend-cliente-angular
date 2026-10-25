import { Routes } from '@angular/router';

// CATALOGO_ROUTES — página principal: listar-productos (HU-B-005); el detalle es un modal
export const CATALOGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listar-productos/listar-productos').then((m) => m.ListarProductos),
  },
];
