import { SolicitudVista } from './solicitud-vista.model';

/** Campos publicados por el presenter de detalle del portal, sin separar motivo_cliente. */
export interface SolicitudDetalle extends Pick<
  SolicitudVista,
  'id' | 'codigo' | 'pedido' | 'monto' | 'estado' | 'fecha_solicitud'
> {
  fecha_resolucion: string | null;
  motivo_cliente: string;
  motivo_rechazo: string | null;
  evidencia: { nombre: string; url: string } | null;
}
