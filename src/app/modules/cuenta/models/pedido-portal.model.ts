import type { ComprobanteEmitido } from '../../checkout/models/checkout.model';
import type { IconName } from '../../../shared/ui/icon/icon';
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
    precio_unitario: number;
    precio_aplicado: number;
    subtotal: number;
    /** `null` si el producto no tiene imagen cargada. Solo viene en el detalle, no en el listado. */
    imagen_url: string | null;
  }[];
  pago: {
    metodo_pago: string;
    monto: number;
    numero_operacion: string;
    fecha_pago: string;
    /** `null` si el pago no tiene comprobante emitido (sin serie activa, por ejemplo). */
    comprobante: ComprobanteEmitido | null;
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

/**
 * El backend maneja 7 estados internos del ERP, pero al cliente solo le importan 5:
 * los dos pasos internos de más (`en_espera_inventario`, `pendiente_entrega`) se
 * fusionan con el paso visible anterior, solo a nivel de vista.
 */
export type EstadoPedidoCliente =
  | 'confirmado'
  | 'en_preparacion'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

const COLAPSO_ESTADO_CLIENTE: Record<EstadoPedido, EstadoPedidoCliente> = {
  confirmado: 'confirmado',
  en_espera_inventario: 'confirmado',
  en_preparacion: 'en_preparacion',
  pendiente_entrega: 'en_preparacion',
  en_camino: 'en_camino',
  entregado: 'entregado',
  cancelado: 'cancelado',
};

export function estadoParaCliente(estado: EstadoPedido): EstadoPedidoCliente {
  return COLAPSO_ESTADO_CLIENTE[estado];
}

export const ESTADOS_PEDIDO_CLIENTE: Record<EstadoPedidoCliente, string> = {
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/** Ícono distinto por estado, para que el badge se distinga de un vistazo. */
export const ICONO_ESTADO_CLIENTE: Record<EstadoPedidoCliente, IconName> = {
  confirmado: 'check',
  en_preparacion: 'clock',
  en_camino: 'truck',
  entregado: 'circle-check',
  cancelado: 'circle-x',
};

/** Clases de color del badge, una por estado (coherentes con el resto de la UI: info/warning/success/danger). */
export const COLOR_ESTADO_CLIENTE: Record<EstadoPedidoCliente, string> = {
  confirmado: 'bg-neutral-50 text-neutral-700',
  en_preparacion: 'bg-warning-50 text-amber-800',
  en_camino: 'bg-info-50 text-info-700',
  entregado: 'bg-success-50 text-success-700',
  cancelado: 'bg-danger-50 text-danger-700',
};
