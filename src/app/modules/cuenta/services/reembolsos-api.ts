import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SolicitudPreparada } from '../models/solicitud-formulario.model';
import { SolicitudDetalle } from '../models/solicitud-detalle.model';
import { PaginaSolicitudes, SolicitudResumen } from '../models/solicitud-portal.model';
import { ESTADOS_SOLICITUD, EstadoSolicitud } from '../models/solicitud-vista.model';

const fechaValida = (fecha: string) =>
  typeof fecha === 'string' && !Number.isNaN(Date.parse(fecha));
const resumenValido = (s: SolicitudResumen) =>
  !!s &&
  Number.isInteger(s.id) &&
  s.id > 0 &&
  typeof s.codigo === 'string' &&
  !!s.codigo.trim() &&
  Number.isInteger(s.pedido?.id) &&
  s.pedido.id > 0 &&
  typeof s.pedido.codigo === 'string' &&
  Number.isFinite(s.monto) &&
  s.monto >= 0 &&
  ESTADOS_SOLICITUD.includes(s.estado) &&
  fechaValida(s.fecha_solicitud) &&
  (s.fecha_resolucion === null || fechaValida(s.fecha_resolucion));

@Service()
export class ReembolsosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/portal/reembolsos`;

  listar(page = 1, estado?: EstadoSolicitud) {
    return this.http
      .get<PaginaSolicitudes>(this.url, {
        params: { page, limit: 10, ...(estado ? { estado } : {}) },
        timeout: 15_000,
        cache: 'no-store',
      })
      .pipe(
        map((pagina) => {
          const meta = pagina?.meta;
          if (
            !Array.isArray(pagina?.data) ||
            !pagina.data.every(resumenValido) ||
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
            throw new Error('El servidor no devolvió un listado de solicitudes válido.');
          }
          return pagina;
        }),
      );
  }

  detalle(id: number) {
    return this.http
      .get<SolicitudDetalle>(`${this.url}/${id}`, { timeout: 15_000, cache: 'no-store' })
      .pipe(
        map((solicitud) => {
          if (
            !resumenValido(solicitud) ||
            solicitud.id !== id ||
            typeof solicitud.motivo_cliente !== 'string' ||
            (solicitud.motivo_rechazo !== null && typeof solicitud.motivo_rechazo !== 'string') ||
            (solicitud.evidencia !== null &&
              (!solicitud.evidencia ||
                typeof solicitud.evidencia.nombre !== 'string' ||
                typeof solicitud.evidencia.url !== 'string'))
          ) {
            throw new Error('El servidor no devolvió el detalle de la solicitud consultada.');
          }
          return solicitud;
        }),
      );
  }

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
