import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UbigeoItem } from '../models/perfil.model';

/** Catálogo de ubicación (ubigeo INEI) para los selects en cascada. */
@Injectable({ providedIn: 'root' })
export class UbigeoApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ubigeo`;

  departamentos(): Observable<UbigeoItem[]> {
    return this.http.get<UbigeoItem[]>(`${this.url}/departamentos`);
  }

  provincias(departamentoId: string): Observable<UbigeoItem[]> {
    return this.http.get<UbigeoItem[]>(`${this.url}/provincias`, {
      params: { departamento_id: departamentoId },
    });
  }

  distritos(provinciaId: string): Observable<UbigeoItem[]> {
    return this.http.get<UbigeoItem[]>(`${this.url}/distritos`, {
      params: { provincia_id: provinciaId },
    });
  }
}
