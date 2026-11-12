import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

/** Cuerpo de `POST /api/v1/auth/cambiar-contrasena` (HU-B-017). */
export interface CambiarContrasenaRequest {
  contrasena_actual: string;
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

/** HU-B-017 (RF-B45): cambio de contraseña del cliente con su sesión iniciada. */
@Injectable({ providedIn: 'root' })
export class ContrasenaApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth/cambiar-contrasena`;

  cambiar(datos: CambiarContrasenaRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.url, datos);
  }
}
