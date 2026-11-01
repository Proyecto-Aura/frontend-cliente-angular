import { ItemCarrito } from '../../carrito/models/carrito.model';
import { ItemResumenRequest, LineaPedido, ResumenPedido } from '../models/checkout.model';

/** Largo mínimo de una dirección con sentido ("Av. 1"), como en el prototipo. */
export const DIRECCION_MINIMA = 6;
/** El backend rechaza una dirección de entrega de más de 255 caracteres. */
export const DIRECCION_MAXIMA = 255;
export const REFERENCIA_MAXIMA = 100;

/** Lo que se envía al servidor: solo las líneas que se pueden comprar. */
export function itemsDelPedido(items: ItemCarrito[]): ItemResumenRequest[] {
  return items
    .filter((i) => i.disponible)
    .map((i) => ({ producto_presentacion_id: i.presentacionId, cantidad: i.cantidad }));
}

/**
 * Identifica el contenido comprable del carrito (qué presentaciones y cuántas):
 * cambia cuando hay que volver a calcular el resumen, y no con el precio.
 */
export function firmaDelPedido(items: ItemCarrito[]): string {
  return itemsDelPedido(items)
    .map((i) => `${i.producto_presentacion_id}:${i.cantidad}`)
    .join(',');
}

/** Dirección y referencia como un solo texto, que es lo que guarda el pedido. */
export function componerDireccion(direccion: string, referencia: string): string {
  const base = direccion.trim();
  const ref = referencia.trim();
  return ref ? `${base} · Ref: ${ref}` : base;
}

/** Mensaje de error de la dirección, o `null` si se puede confirmar. */
export function errorDeDireccion(direccion: string, referencia: string): string | null {
  if (direccion.trim().length < DIRECCION_MINIMA) return 'Ingresa la dirección de entrega.';
  if (componerDireccion(direccion, referencia).length > DIRECCION_MAXIMA) {
    return 'La dirección y la referencia son demasiado largas.';
  }
  return null;
}

/** Une lo calculado por el servidor con el nombre, la presentación y la imagen del carrito. */
export function lineasDelPedido(
  items: ItemCarrito[],
  resumen: ResumenPedido | null,
): LineaPedido[] {
  if (!resumen) return [];
  const porPresentacion = new Map(items.map((i) => [i.presentacionId, i]));
  return resumen.items.flatMap((linea) => {
    const item = porPresentacion.get(linea.producto_presentacion_id);
    return item
      ? [
          {
            presentacionId: item.presentacionId,
            nombre: item.nombre,
            presentacion: item.presentacion,
            imagenUrl: item.imagenUrl,
            cantidad: linea.cantidad,
            precioUnitario: linea.precio_unitario,
            precioAplicado: linea.precio_aplicado,
            esMayorista: linea.es_mayorista,
            subtotal: linea.subtotal,
          },
        ]
      : [];
  });
}
