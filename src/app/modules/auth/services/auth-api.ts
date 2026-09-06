import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { LoginRequest, LoginResponse, RegistroResponse } from '../models/auth.model';
import { RegisterClientePayload } from '../models/registro.model';

/** Cliente HTTP del módulo Auth del backend (`/api/v1/auth`). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);
  private readonly base = `${environment.apiUrl}/auth`;

  /**
   * `withCredentials` es obligatorio: el backend devuelve el `refresh_token`
   * como cookie httpOnly y su CORS está con `credentials: true`.
   */
  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, body, { withCredentials: true })
      .pipe(tap((res) => this.session.start(res.access_token, res.roles)));
  }

  registrarCliente(body: RegisterClientePayload): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.base}/register`, body, {
      withCredentials: true,
    });
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.base}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.session.clear()));
  }
}
