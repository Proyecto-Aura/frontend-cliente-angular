/** Contrato del catálogo público del backend (`/api/v1/catalogo`, HU-B-005). */

export type OrdenCatalogo = 'precio_asc' | 'precio_desc';

export interface CategoriaCatalogo {
  id: number;
  nombre: string;
}

export interface PromocionCatalogo {
  tipo: string;
  nombre: string;
  /** Texto listo para mostrar: "10% de descuento", "3x2", … */
  descripcion: string;
  valor: number | null;
  cantidad_paga: number | null;
  cantidad_lleva: number | null;
  /** Días `YYYY-MM-DD`. */
  fecha_inicio: string;
  fecha_fin: string;
}

export interface PresentacionCatalogo {
  id: number;
  slug: string | null;
  presentacion: {
    id: number;
    cantidad: number;
    unidad_medida: 'kg' | 'gr';
    descripcion: string | null;
  };
  imagen_url: string | null;
  precio: number;
  /** Precio con la promoción vigente aplicada (igual a `precio` si no hay). */
  precio_final: number;
  /** Hay stock: si es `false` se muestra "No disponible". */
  disponible: boolean;
  promocion: PromocionCatalogo | null;
}

/** Fila del listado: una por presentación, con los datos de su producto. */
export interface ItemCatalogo extends PresentacionCatalogo {
  producto_id: number;
  nombre: string;
  descripcion: string | null;
  destacado: boolean;
  categoria: CategoriaCatalogo;
}

export interface PaginaCatalogo {
  data: ItemCatalogo[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}

/** Producto con sus presentaciones: la tarjeta del listado y el detalle. */
export interface ProductoCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
  destacado: boolean;
  categoria: CategoriaCatalogo;
  presentaciones: PresentacionCatalogo[];
}

export interface FiltrosCatalogo {
  q: string;
  categoriaId: number | null;
  orden: OrdenCatalogo | null;
}
