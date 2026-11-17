import { ParamMap } from '@angular/router';

import {
  CategoriaCatalogo,
  FiltrosCatalogo,
  ItemCatalogo,
  OrdenCatalogo,
  PresentacionCatalogo,
  ProductoCatalogo,
  PromocionCatalogo,
} from '../models/catalogo.model';

/**
 * El backend lista una fila por presentación; la tienda muestra una tarjeta
 * por producto. Se respeta el orden de llegada (el del backend).
 */
export function agruparPorProducto(items: ItemCatalogo[]): ProductoCatalogo[] {
  const productos = new Map<number, ProductoCatalogo>();
  for (const { producto_id, nombre, descripcion, destacado, categoria, ...presentacion } of items) {
    const producto = productos.get(producto_id);
    if (producto) {
      producto.presentaciones.push(presentacion);
    } else {
      productos.set(producto_id, {
        id: producto_id,
        nombre,
        descripcion,
        destacado,
        categoria,
        presentaciones: [presentacion],
      });
    }
  }
  return [...productos.values()];
}

/** Categorías distintas de las filas, ordenadas por nombre (filtro "Categoría"). */
export function categoriasDe(items: ItemCatalogo[]): CategoriaCatalogo[] {
  const categorias = new Map(items.map((i) => [i.categoria.id, i.categoria]));
  return [...categorias.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Índice de la presentación a mostrar primero: la primera con stock, o la primera. */
export function presentacionInicial(presentaciones: PresentacionCatalogo[]): number {
  return Math.max(
    presentaciones.findIndex((p) => p.disponible),
    0,
  );
}

/** "250g", "1kg" (como en el prototipo). */
export function etiquetaPresentacion({ presentacion }: PresentacionCatalogo): string {
  return `${presentacion.cantidad}${presentacion.unidad_medida === 'gr' ? 'g' : 'kg'}`;
}

/** Etiqueta corta de la promoción para la tarjeta: "-10%", "-S/ 3.00", "3x2". */
export function etiquetaPromocion(promo: PromocionCatalogo): string {
  switch (promo.tipo) {
    case 'porcentaje':
      return `-${promo.valor}%`;
    case 'monto_fijo':
      return `-${formatearPrecio(promo.valor ?? 0)}`;
    case 'nxm':
      return promo.cantidad_lleva && promo.cantidad_paga
        ? `${promo.cantidad_lleva}x${promo.cantidad_paga}`
        : promo.nombre;
    default:
      return promo.nombre;
  }
}

/** "S/ 12.50". */
export function formatearPrecio(monto: number): string {
  return `S/ ${monto.toFixed(2)}`;
}

/** `YYYY-MM-DD` → `DD/MM/YYYY`. */
export function formatearDia(dia: string): string {
  const [anio, mes, d] = dia.split('-');
  return `${d}/${mes}/${anio}`;
}

/** Nombres de los filtros en la URL del catálogo: `/catalogo?q=&categoria=&orden=`. */
export const PARAM = { q: 'q', categoria: 'categoria', orden: 'orden' } as const;

const ORDENES: readonly OrdenCatalogo[] = ['precio_asc', 'precio_desc'];

/** Filtros a partir de la URL; lo que no es válido se ignora. */
export function filtrosDesdeQuery(query: ParamMap): FiltrosCatalogo {
  const categoria = Number(query.get(PARAM.categoria));
  const orden = query.get(PARAM.orden) as OrdenCatalogo | null;
  return {
    q: (query.get(PARAM.q) ?? '').trim(),
    categoriaId: Number.isInteger(categoria) && categoria > 0 ? categoria : null,
    orden: orden && ORDENES.includes(orden) ? orden : null,
  };
}
