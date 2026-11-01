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
