import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { Session } from './session';

/**
 * Protege rutas que requieren sesión iniciada (ej. /mi-cuenta).
 * Sin sesión, redirige a la pantalla de login preservando la URL intentada.
 */
export const authGuard: CanActivateFn = (_route, state: RouterStateSnapshot) => {
  const session = inject(Session);
  if (session.isAuthenticated()) return true;

  return inject(Router).createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
