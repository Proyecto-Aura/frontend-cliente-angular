import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';

/**
 * Adjunta `Authorization: Bearer <access_token>` a las llamadas al backend.
 * Se saltan `/auth/login`, `/auth/register` y `/auth/refresh`: son públicas.
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const esApi = req.url.startsWith(environment.apiUrl);
  const esPublica = /\/auth\/(login|register|refresh)$/.test(req.url);
  if (!esApi || esPublica) {
    return next(req);
  }

  const token = inject(Session).accessToken();
  return token ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })) : next(req);
};
