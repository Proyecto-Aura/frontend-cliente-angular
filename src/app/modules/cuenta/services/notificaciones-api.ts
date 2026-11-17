import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificacionPortal, PaginaNotificaciones } from '../models/notificacion-portal.model';

const fechaValida = (fecha: string) =>
  typeof fecha === 'string' && !Number.isNaN(Date.parse(fecha));
const notificacionValida = (n: NotificacionPortal) =>
  !!n &&
  Number.isInteger(n.id) &&
  n.id > 0 &&
  typeof n.tipo === 'string' &&
  typeof n.titulo === 'string' &&
  typeof n.mensaje === 'string' &&
  (n.referencia_id === null || typeof n.referencia_id === 'string') &&
  (n.referencia_tipo === null || typeof n.referencia_tipo === 'string') &&
  typeof n.leido === 'boolean' &&
  fechaValida(n.created_at) &&
  (n.fecha_leido === null || fechaValida(n.fecha_leido));

@Service()
export class NotificacionesApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/portal/notificaciones`;

  listar(page = 1) {
    // Sin filtro leido: conserva también los avisos ya leídos.
    return this.http
      .get<PaginaNotificaciones>(this.url, {
        params: { page, limit: 10 },
        timeout: 15_000,
        cache: 'no-store',
      })
      .pipe(
        map((pagina) => {
          const meta = pagina?.meta;
          if (
            !Array.isArray(pagina?.data) ||
            !pagina.data.every(notificacionValida) ||
            !meta ||
            !Number.isInteger(meta.page) ||
            meta.page < 1 ||
            !Number.isInteger(meta.limit) ||
            meta.limit < 1 ||
            !Number.isInteger(meta.total) ||
            meta.total < 0 ||
            !Number.isInteger(meta.total_pages) ||
            meta.total_pages < 0
          ) {
            throw new Error('El servidor no devolvió un listado de notificaciones válido.');
          }
          return pagina;
        }),
      );
  }

  marcarLeida(id: number) {
    return this.http
      .patch<{ marcada: boolean }>(`${this.url}/${id}/leida`, {}, { timeout: 15_000 })
      .pipe(
        map((respuesta) => {
          if (respuesta?.marcada !== true)
            throw new Error('No se pudo confirmar la lectura de la notificación.');
          return respuesta;
        }),
      );
  }
}
