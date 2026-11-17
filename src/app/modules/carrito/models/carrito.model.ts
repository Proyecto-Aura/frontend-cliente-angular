/**
 * Una línea del carrito (HU-B-006). Guarda una copia de lo que se mostró al
 * agregarla para pintar el carrito al instante; precio, promoción y stock se
 * refrescan con el catálogo al abrirlo.
 */
export interface ItemCarrito {
  presentacionId: number;
  productoId: number;
  nombre: string;
  categoria: string;
  /** "250g", "1kg". */
  presentacion: string;
  imagenUrl: string | null;
  precio: number;
  /** Precio con la promoción vigente aplicada. */
  precioFinal: number;
  /** Etiqueta corta de la promoción ("-10%", "3x2"), si hay. */
  promocion: string | null;
  disponible: boolean;
  cantidad: number;
}

/** Lo que se guarda en localStorage. */
export interface CarritoGuardado {
  /** Última modificación del cliente (ms): el carrito vence 7 días después. */
  actualizado: number;
  items: ItemCarrito[];
}
