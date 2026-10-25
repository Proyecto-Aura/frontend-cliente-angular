import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import {
  LoginRequest,
  LoginResponse,
  MensajeResponse,
  RestablecerContrasenaRequest,
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

  /**
   * HU-B-004: el backend revoca la sesión de la cookie y con ella el JWT, que
   * deja de servir. La sesión local se borra aunque la llamada falle: el
   * cliente quiere salir y no debe quedar dentro.
   */
  cerrarSesion(): Observable<void> {
    return this.http.post(`${this.base}/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      map(() => this.session.clear()),
    );
  }

  /**
   * HU-B-003 (RF-B11): pide el enlace para restablecer la contraseña. El
   * backend responde lo mismo exista o no el correo, para no revelar cuentas.
   */
  solicitarRecuperacion(email: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.base}/forgot-password`, { email });
  }

  /** HU-B-003 (RF-B12): nueva contraseña con el token del enlace del correo. */
  restablecerContrasena(body: RestablecerContrasenaRequest): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.base}/reset-password`, body);
  }

  /**
   * HU-A-005: confirma el correo con el token del enlace del mensaje (vence en
   * 24 h y se usa una sola vez). 400 si es inválido, venció o ya se usó.
   */
  verificarCorreo(token: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.base}/verify-email`, { token });
  }

  /**
   * HU-A-005: pide un enlace de verificación nuevo (invalida el anterior). El
   * backend responde 200 con el mismo mensaje exista o no el correo, y no envía
   * otro si se pidió hace menos de 60 s.
   */
  reenviarVerificacion(email: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.base}/resend-verification`, { email });
  }

  // Revoca el refresh token recién creado; si falla, igual no se deja entrar.
  private rechazarSinAcceso(): Observable<never> {
    return this.http.post(`${this.base}/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      switchMap(() => throwError(() => new SinAccesoAlPortalError())),
    );
  }
}
