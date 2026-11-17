import { ItemCatalogo, PaginaCatalogo, PromocionCatalogo } from '../models/catalogo.model';

/** Datos de prueba del catálogo público con la forma que responde el backend. */

export const CHIFLES = { id: 1, nombre: 'Chifles' };
export const FRUTOS = { id: 2, nombre: 'Frutos secos' };

export const PROMO_10: PromocionCatalogo = {
  tipo: 'porcentaje',
  nombre: 'Semana del chifle',
  descripcion: '10% de descuento',
  valor: 10,
  cantidad_paga: null,
  cantidad_lleva: null,
  fecha_inicio: '2026-10-01',
  fecha_fin: '2026-10-31',
};

export function item(over: Partial<ItemCatalogo> & { id: number }): ItemCatalogo {
  return {
    slug: null,
    producto_id: 10,
    nombre: 'Chifle salado',
    descripcion: 'Plátano verde frito',
    destacado: false,
    categoria: CHIFLES,
    presentacion: { id: 1, cantidad: 250, unidad_medida: 'gr', descripcion: null },
    imagen_url: null,
    precio: 5,
    precio_final: 5,
    disponible: true,
    promocion: null,
    ...over,
  };
}

/** Chifle salado (250 gr y 1 kg con promoción) y Mix de frutos (agotado). */
export const ITEMS: ItemCatalogo[] = [
  item({ id: 101 }),
  item({
    id: 102,
    presentacion: { id: 2, cantidad: 1, unidad_medida: 'kg', descripcion: 'Bolsa familiar' },
    precio: 18,
    precio_final: 16.2,
    promocion: PROMO_10,
  }),
  item({
    id: 201,
    producto_id: 20,
    nombre: 'Mix de frutos',
    descripcion: null,
    categoria: FRUTOS,
    precio: 12,
    precio_final: 12,
    disponible: false,
  }),
];

export function pagina(data: ItemCatalogo[], page = 1, totalPages = 1): PaginaCatalogo {
  return { data, meta: { total: data.length, page, limit: 100, total_pages: totalPages } };
}
