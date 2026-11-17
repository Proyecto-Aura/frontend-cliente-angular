import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Session } from './session';

/** Sin sesión no se entra: se manda al login (HU-B-004, tras cerrar sesión). */
export const sesionGuard: CanActivateFn = () =>
  inject(Session).isAuthenticated() || inject(Router).createUrlTree(['/auth/login']);
