import { PedidoPortalDetalle, PedidoPortalResumen } from '../models/pedido-portal.model';

/** Fixtures exclusivos de pruebas unitarias. Nunca se cargan en las páginas reales. */
export const PEDIDO_RESUMEN_PRUEBA: PedidoPortalResumen = {
  id: 21,
  codigo: 'PED-PRUEBA-021',
  estado: 'confirmado',
  tipo_entrega: 'recojo_tienda',
  total: 12,
  metodo_pago: 'tarjeta',
  fecha_entrega: null,
  created_at: '2026-11-05T12:00:00Z',
  reembolso: null,
};

export const PEDIDO_DETALLE_PRUEBA: PedidoPortalDetalle = {
  id: 21,
  codigo: 'PED-PRUEBA-021',
  estado: 'confirmado',
  total: 12,
  created_at: '2026-11-05T12:00:00Z',
  items: [
    {
      id: 1,
      producto_presentacion_id: 1,
      sku: 'PRUEBA',
      producto: 'Producto de prueba',
      presentacion: '250 gr',
      cantidad: 2,
      subtotal: 12,
    },
  ],
  pago: {
    metodo_pago: 'tarjeta',
    monto: 12,
    numero_operacion: 'SIM-PRUEBA',
    fecha_pago: '2026-11-05T12:00:00Z',
  },
};
