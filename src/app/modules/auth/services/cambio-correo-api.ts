import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MensajeResponse } from '../models/auth.model';

/**
 * HU-B-016 (RF-B44): confirma el correo nuevo con el token del enlace que el
 * backend envía a esa dirección. La ruta es pública: el enlace se puede abrir
 * sin sesión.
 */
@Injectable({ providedIn: 'root' })
export class CambioCorreoApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/perfil/email/verificar`;

  verificar(token: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(this.url, { token });
  }
}
