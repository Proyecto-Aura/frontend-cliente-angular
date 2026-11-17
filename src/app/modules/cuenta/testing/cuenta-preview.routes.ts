import { Routes } from '@angular/router';
import { sesionGuard } from '../../../shared/auth/sesion.guard';

/** Se sustituye por una lista vacía al compilar para producción. */
export const CUENTA_PREVIEW_ROUTES: Routes = [
  {
    path: 'solicitudes/vista-previa',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./cuenta-solicitudes-demo/cuenta-solicitudes-demo').then(
        (m) => m.CuentaSolicitudesDemo,
      ),
  },
];
