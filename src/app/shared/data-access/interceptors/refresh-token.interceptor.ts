import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthApi } from '../../../modules/auth/services/auth-api';
import { RefreshResponse } from '../../../modules/auth/models/auth.model';
import { Session } from '../../auth/session';

/** Rutas de `/auth` que nunca disparan un refresh: evitan el loop. */
const SIN_REFRESH = /\/auth\/(login|register|refresh|logout)$/;

/** Un solo refresh en vuelo aunque varias peticiones venzan a la vez. */
let refrescando: Observable<RefreshResponse> | null = null;

/**
 * El access_token dura 40 min y acá no hay nada que lo renueve antes. Si una
 * llamada protegida responde 401, intenta un refresh (una sola vez, aunque
 * varias peticiones fallen a la vez) y reintenta la petición original con el
 * token nuevo. Si el refresh también falla, no hay sesión recuperable: limpia
 * el estado local y manda al login.
 */
export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const esApi = req.url.startsWith(environment.apiUrl);
  if (!esApi || SIN_REFRESH.test(req.url)) {
    return next(req);
  }

  const authApi = inject(AuthApi);
  const session = inject(Session);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      refrescando ??= authApi.refrescar().pipe(
        catchError((refreshErr: unknown) => {
          session.clear();
          void router.navigate(['/auth/login'], { replaceUrl: true });
          return throwError(() => refreshErr);
        }),
        finalize(() => (refrescando = null)),
        shareReplay(1),
      );
      return refrescando.pipe(switchMap(() => next(req)));
    }),
  );
};
