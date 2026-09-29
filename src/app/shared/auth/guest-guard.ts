import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Session } from './session';

/**
 * Protege las pantallas de auth (login / registro) de quien ya tiene sesión.
 * Con sesión activa, redirige al catálogo en vez de mostrar login de nuevo.
 */
export const guestGuard: CanActivateFn = () => {
  const session = inject(Session);
  if (!session.isAuthenticated()) return true;

  return inject(Router).createUrlTree(['/catalogo']);
};
