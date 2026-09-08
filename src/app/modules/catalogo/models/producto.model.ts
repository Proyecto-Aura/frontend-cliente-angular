/** Promoción de un producto (etiqueta que se muestra sobre la card). */
export type Promocion = '2x1' | '3x2' | '4x3';

/** Producto del catálogo del portal cliente. */
export interface Producto {
  id: number;
  name: string;
  desc: string;
  category: string;
  price: number;
  weight: string;
  img: string;
  available: boolean;
  promo: Promocion | null;
  stock: number;
}
