export type EstadoPago = 'pending' | 'paid';
export type EstadoEntrega = 'processing' | 'shipping' | 'delivered';

/** Pedido tal como se muestra en el historial del cliente. */
export interface Pedido {
  id: string;
  date: string;
  payment: EstadoPago;
  delivery: EstadoEntrega;
  thumbs: string[];
  summary: string;
  total: number;
  items: number;
}
