import { EstadoPedido, PedidoPortalVista } from './pedido-portal.model';

/** Modelo de presentación adaptado desde resumen y detalle del pedido. */
export interface PedidoReembolsoVista {
  id: number;
  codigo: string;
  fecha: string;
  estado: EstadoPedido;
  pagado: boolean;
  tieneSolicitud: boolean;
  montoPagado: number;
}

export function esPedidoElegible(pedido: PedidoReembolsoVista): boolean {
  return (
    ['confirmado', 'entregado', 'cancelado'].includes(pedido.estado) &&
    pedido.pagado &&
    !pedido.tieneSolicitud
  );
}

export function pedidoParaReembolso(vista: PedidoPortalVista): PedidoReembolsoVista | null {
  const { resumen, detalle } = vista;
  if (!detalle || detalle.id !== resumen.id) return null;
  return {
    id: detalle.id,
    codigo: detalle.codigo,
    fecha: detalle.created_at,
    estado: detalle.estado,
    pagado: detalle.pago !== null,
    tieneSolicitud: resumen.reembolso !== null,
    montoPagado: detalle.pago?.monto ?? 0,
  };
}

/** Valores validados en memoria; esta fase no los envía ni los guarda. */
export interface SolicitudPreparada {
  pedido_id: number;
  motivo: string;
  descripcion: string;
  evidencia: File;
}

export const MOTIVOS_SOLICITUD = [
  'Producto llegó dañado',
  'Producto incorrecto',
  'Producto en mal estado',
  'Producto no entregado',
  'Pedido incompleto',
  'Otro',
] as const;

/** El MaxFileSizeValidator instalado en backend usa <, no <=. */
export const LIMITE_EVIDENCIA_BYTES = 5 * 1024 * 1024;
export const TIPOS_EVIDENCIA = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
