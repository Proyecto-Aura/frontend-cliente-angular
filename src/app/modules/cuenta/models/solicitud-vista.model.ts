/** Modelo de presentación del listado; no define ni amplía un contrato HTTP. */
export type EstadoSolicitud = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';

export interface SolicitudVista {
  id: number;
  codigo: string;
  pedido: { id: number; codigo: string };
  monto: number;
  estado: EstadoSolicitud;
  fecha_solicitud: string;
  /** Textos publicados por la API; pueden faltar en registros históricos. */
  motivo?: string | null;
  descripcion?: string | null;
}

export const ESTADOS_SOLICITUD: readonly EstadoSolicitud[] = [
  'pendiente',
  'aprobado',
  'rechazado',
  'reembolsado',
];
