export type TipoComprobante = 'boleta' | 'factura';
export type MetodoPago = 'culqi' | 'presencial';

/** Datos que se enviarán al backend al crear el pedido (HU futura). */
export interface PedidoDraft {
  nombre: string;
  telefono: string;
  direccion: string;
  referencia: string;
  distrito: string;
  comprobante: TipoComprobante;
  ruc?: string;
  razonSocial?: string;
  metodoPago: MetodoPago;
}
