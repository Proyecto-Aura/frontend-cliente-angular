import { EstadoSolicitud } from './solicitud-vista.model';

export type EstadoPedido =
  | 'confirmado'
  | 'en_espera_inventario'
  | 'en_preparacion'
  | 'pendiente_entrega'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

/** GET /portal/pedidos: no incluye las líneas ni el monto del pago. */
export interface PedidoPortalResumen {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  tipo_entrega: 'delivery' | 'recojo_tienda';
  total: number;
  metodo_pago: string | null;
  fecha_entrega: string | null;
  created_at: string;
  reembolso: { id: number; estado: EstadoSolicitud } | null;
}

/** Campos consumidos de GET /portal/pedidos/{id}. */
export interface PedidoPortalDetalle {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  total: number;
  created_at: string;
  items: {
    id: number;
    producto_presentacion_id: number;
    sku: string;
    producto: string;
    presentacion: string;
    cantidad: number;
    subtotal: number;
  }[];
  pago: {
    metodo_pago: string;
    monto: number;
    numero_operacion: string;
    fecha_pago: string;
  } | null;
}

export interface PaginaPedidos {
  data: PedidoPortalResumen[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}

export interface PedidoPortalVista {
  resumen: PedidoPortalResumen;
  detalle: PedidoPortalDetalle | null;
  errorDetalle: string | null;
}

export const ESTADOS_PEDIDO: Record<EstadoPedido, string> = {
  confirmado: 'Confirmado',
  en_espera_inventario: 'En espera de inventario',
  en_preparacion: 'En preparación',
  pendiente_entrega: 'Pendiente de entrega',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};
