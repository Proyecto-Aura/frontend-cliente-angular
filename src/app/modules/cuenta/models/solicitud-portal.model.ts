import { SolicitudDetalle } from './solicitud-detalle.model';

/** GET /portal/reembolsos: textos separados; evidencia solo en el detalle. */
export type SolicitudResumen = Pick<
  SolicitudDetalle,
  | 'id'
  | 'codigo'
  | 'pedido'
  | 'monto'
  | 'estado'
  | 'motivo'
  | 'descripcion'
  | 'fecha_solicitud'
  | 'fecha_resolucion'
  | 'fecha_reembolso'
>;

export interface PaginaSolicitudes {
  data: SolicitudResumen[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}
