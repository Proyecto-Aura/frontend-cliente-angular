import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import {
  LoginRequest,
  LoginResponse,
  ROL_CLIENTE,
  RegistroResponse,
  SinAccesoAlPortalError,
} from '../models/auth.model';
import { RegisterClientePayload } from '../models/registro.model';

/** Cliente HTTP del módulo Auth del backend (`/api/v1/auth`). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);
  private readonly base = `${environment.apiUrl}/auth`;

  /**
   * HU-B-001. `withCredentials` es obligatorio: el backend devuelve el
   * `refresh_token` como cookie httpOnly y su CORS está con `credentials: true`.
   * Solo entran los clientes: a otro rol se le cierra la sesión que el backend
   * acaba de abrir y se responde como a unas credenciales inválidas.
   */
  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, body, { withCredentials: true })
      .pipe(
        switchMap((res) => (res.roles.includes(ROL_CLIENTE) ? of(res) : this.rechazarSinAcceso())),
        tap((res) => this.session.start(res.access_token, res.roles)),
      );
  }

  /**
   * HU-B-002: crea la cuenta del cliente. El backend la deja sin verificar y
   * envía el correo de verificación; no inicia sesión.
   */
  registrarCliente(body: RegisterClientePayload): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.base}/register`, body);
  }

  // Revoca el refresh token recién creado; si falla, igual no se deja entrar.
  private rechazarSinAcceso(): Observable<never> {
    return this.http.post(`${this.base}/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      switchMap(() => throwError(() => new SinAccesoAlPortalError())),
    );
  }
}
