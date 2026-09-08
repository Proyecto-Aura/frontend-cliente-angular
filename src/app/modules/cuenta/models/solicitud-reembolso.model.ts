export type EstadoSolicitud = 'pending' | 'approved' | 'rejected';

/** Solicitud de reembolso asociada a un pedido. */
export interface SolicitudReembolso {
  id: string;
  date: string;
  orderId: string;
  orderSummary: string;
  orderTotal: number;
  motivo: string;
  descripcion: string;
  status: EstadoSolicitud;
}
