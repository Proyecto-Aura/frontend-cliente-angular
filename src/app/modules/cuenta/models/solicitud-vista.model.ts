/** Modelo de presentación del listado; no define ni amplía un contrato HTTP. */
export type EstadoSolicitud = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';

export interface SolicitudVista {
  id: number;
  codigo: string;
  pedido: { id: number; codigo: string };
  monto: number;
  estado: EstadoSolicitud;
  fecha_solicitud: string;
  /** Textos opcionales del prototipo. No se deducen del resumen de la API. */
  motivo?: string;
  descripcion?: string;
}

export const ESTADOS_SOLICITUD: readonly EstadoSolicitud[] = [
  'pendiente',
  'aprobado',
  'rechazado',
  'reembolsado',
];
