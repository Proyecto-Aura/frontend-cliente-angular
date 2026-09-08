import { Producto } from '../../catalogo/models/producto.model';

/** Línea del carrito: un producto y su cantidad. */
export interface ItemCarrito {
  product: Producto;
  qty: number;
}
