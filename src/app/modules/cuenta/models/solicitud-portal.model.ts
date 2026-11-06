import { SolicitudDetalle } from './solicitud-detalle.model';

/** GET /portal/reembolsos: motivo y evidencia solo se publican en el detalle. */
export type SolicitudResumen = Pick<
  SolicitudDetalle,
  'id' | 'codigo' | 'pedido' | 'monto' | 'estado' | 'fecha_solicitud' | 'fecha_resolucion'
>;

export interface PaginaSolicitudes {
  data: SolicitudResumen[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}
