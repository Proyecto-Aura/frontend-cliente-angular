import { SolicitudVista } from './solicitud-vista.model';

/** Contrato del portal: conserva motivo_cliente para compatibilidad. */
export interface SolicitudDetalle extends Pick<
  SolicitudVista,
  'id' | 'codigo' | 'pedido' | 'monto' | 'estado' | 'fecha_solicitud'
> {
  fecha_resolucion: string | null;
  motivo: string | null;
  descripcion: string | null;
  fecha_reembolso: string | null;
  motivo_cliente: string;
  motivo_rechazo: string | null;
  evidencia: { nombre: string; url: string } | null;
}
