/** Contrato de `POST /api/v1/portal/pedidos/resumen` (HU-B-007). */

export type TipoEntrega = 'delivery' | 'recojo_tienda';

export interface ItemResumenRequest {
  producto_presentacion_id: number;
  cantidad: number;
}

export interface ResumenPedidoRequest {
  items: ItemResumenRequest[];
  tipo_entrega: TipoEntrega;
  /** Solo con delivery: vale para este pedido; si falta, el backend usa la del perfil. */
  direccion_entrega?: string;
}

/** Una línea ya calculada por el servidor (RN17: mayorista al superar el umbral). */
export interface LineaResumen {
  producto_presentacion_id: number;
  cantidad: number;
  precio_unitario: number;
  /** Precio que se cobra: el mayorista si la cantidad supera el umbral. */
  precio_aplicado: number;
  es_mayorista: boolean;
  subtotal: number;
}

export interface ResumenPedido {
  tipo_entrega: TipoEntrega;
  /** Dirección guardada en el perfil del cliente (la predeterminada). */
  direccion_perfil: string | null;
  /** Solo con delivery: la dirección con la que se calculó el resumen. */
  direccion_entrega: string | null;
  items: LineaResumen[];
  subtotal: number;
  total: number;
}

/** Una línea del resumen con los datos del carrito para dibujarla. */
export interface LineaPedido {
  presentacionId: number;
  nombre: string;
  presentacion: string;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  precioAplicado: number;
  esMayorista: boolean;
  subtotal: number;
}

/** Medio de pago que el cliente elige en el checkout de Culqi (RF-B24). */
export type MedioPago = 'tarjeta' | 'yape' | 'plin';

/** Cuerpo de `POST /api/v1/portal/pedidos` (HU-B-008): el resumen más el token de pago. */
export interface CrearPedidoRequest {
  items: ItemResumenRequest[];
  tipo_entrega: TipoEntrega;
  direccion_entrega?: string;
  /** Token que entrega el checkout de Culqi; el total lo recalcula el servidor. */
  culqi_token: string;
}

/** Pedido ya creado y pagado (respuesta 201 de `POST /api/v1/portal/pedidos`). */
export interface PedidoPagado {
  id: number;
  codigo: string;
  estado: string;
  tipo_entrega: TipoEntrega;
  direccion_entrega: string | null;
  total: number;
  items: {
    producto_presentacion_id: number;
    producto: string;
    presentacion: string;
    cantidad: number;
    precio_aplicado: number;
    subtotal: number;
  }[];
  pago: {
    metodo_pago: string;
    monto: number;
    numero_operacion: string | null;
    fecha_pago: string;
  } | null;
}
