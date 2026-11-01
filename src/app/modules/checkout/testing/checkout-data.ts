import { ItemCarrito } from '../../carrito/models/carrito.model';
import { PerfilCliente } from '../../cuenta/models/perfil.model';
import { LineaResumen, ResumenPedido } from '../models/checkout.model';

/** Datos de prueba del checkout con la forma que responde el backend. */

export function itemCarrito(over: Partial<ItemCarrito> & { presentacionId: number }): ItemCarrito {
  return {
    productoId: 10,
    nombre: 'Chifle salado',
    categoria: 'Chifles',
    presentacion: '250g',
    imagenUrl: null,
    precio: 5,
    precioFinal: 5,
    promocion: null,
    disponible: true,
    cantidad: 2,
    ...over,
  };
}

export function lineaResumen(
  over: Partial<LineaResumen> & { producto_presentacion_id: number },
): LineaResumen {
  return {
    cantidad: 2,
    precio_unitario: 5,
    precio_aplicado: 5,
    es_mayorista: false,
    subtotal: 10,
    ...over,
  };
}

export function resumenPedido(over: Partial<ResumenPedido> = {}): ResumenPedido {
  return {
    tipo_entrega: 'recojo_tienda',
    direccion_perfil: 'Av. Los Girasoles 123, San Miguel',
    direccion_entrega: null,
    items: [lineaResumen({ producto_presentacion_id: 101 })],
    subtotal: 10,
    total: 10,
    ...over,
  };
}

export const PERFIL: PerfilCliente = {
  nombres: 'Rosa Elena',
  apellido_paterno: 'Quispe',
  apellido_materno: 'Huamán',
  email: 'rosa@francos.test',
  telefono: '987654321',
  tipo_documento: 'dni',
  numero_documento: '45678912',
  tipo_cliente: 'persona_natural',
  razon_social: null,
};
