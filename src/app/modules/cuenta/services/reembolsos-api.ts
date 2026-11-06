import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SolicitudPreparada } from '../models/solicitud-formulario.model';
import { SolicitudDetalle } from '../models/solicitud-detalle.model';

@Service()
export class ReembolsosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/portal/reembolsos`;

  solicitar(solicitud: SolicitudPreparada) {
    const datos = new FormData();
    datos.append('pedido_id', String(solicitud.pedido_id));
    datos.append('motivo', solicitud.motivo.trim());
    datos.append('descripcion', solicitud.descripcion.trim());
    datos.append('evidencia', solicitud.evidencia, solicitud.evidencia.name);
    // El navegador pone el boundary. No enviar monto ni identidad del cliente.
    return this.http.post<SolicitudDetalle>(this.url, datos, { timeout: 30_000 }).pipe(
      map((respuesta) => {
        if (
          !respuesta ||
          !Number.isInteger(respuesta.id) ||
          respuesta.id <= 0 ||
          typeof respuesta.codigo !== 'string' ||
          !respuesta.codigo.trim() ||
          respuesta.pedido?.id !== solicitud.pedido_id ||
          respuesta.estado !== 'pendiente' ||
          !Number.isFinite(respuesta.monto) ||
          respuesta.monto < 0
        ) {
          throw new Error('No se pudo confirmar el registro de la solicitud.');
        }
        return respuesta;
      }),
    );
  }
}
