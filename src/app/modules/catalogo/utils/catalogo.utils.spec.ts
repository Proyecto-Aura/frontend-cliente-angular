import { convertToParamMap } from '@angular/router';

import { CHIFLES, FRUTOS, ITEMS, PROMO_10 } from '../testing/catalogo-data';
import {
  agruparPorProducto,
  categoriasDe,
  etiquetaPresentacion,
  etiquetaPromocion,
  filtrosDesdeQuery,
  formatearDia,
  formatearPrecio,
  presentacionInicial,
} from './catalogo.utils';

describe('catalogo.utils', () => {
  it('groups the rows (one per presentation) into products, keeping the API order', () => {
    const productos = agruparPorProducto(ITEMS);

    expect(productos.map((p) => p.nombre)).toEqual(['Chifle salado', 'Mix de frutos']);
    expect(productos[0].presentaciones.map((p) => p.id)).toEqual([101, 102]);
    expect(productos[0].categoria).toEqual(CHIFLES);
  });

  it('lists each category once, sorted by name', () => {
    expect(categoriasDe([...ITEMS].reverse())).toEqual([CHIFLES, FRUTOS]);
  });

  it('starts with the first presentation in stock', () => {
    const [agotada, conStock] = [{ ...ITEMS[0], disponible: false }, ITEMS[1]];

    expect(presentacionInicial([agotada, conStock])).toBe(1);
    expect(presentacionInicial([agotada])).toBe(0);
  });

  it('formats presentations, prices and days like the prototype', () => {
    expect(etiquetaPresentacion(ITEMS[0])).toBe('250g');
    expect(etiquetaPresentacion(ITEMS[1])).toBe('1kg');
    expect(formatearPrecio(16.2)).toBe('S/ 16.20');
    expect(formatearDia('2026-10-31')).toBe('31/10/2026');
  });

  it('shortens the promotion for the card tag', () => {
    expect(etiquetaPromocion(PROMO_10)).toBe('-10%');
    expect(etiquetaPromocion({ ...PROMO_10, tipo: 'monto_fijo', valor: 3 })).toBe('-S/ 3.00');
    expect(
      etiquetaPromocion({ ...PROMO_10, tipo: 'nxm', cantidad_lleva: 3, cantidad_paga: 2 }),
    ).toBe('3x2');
  });

  it('reads the filters from the URL and ignores invalid values', () => {
    expect(
      filtrosDesdeQuery(convertToParamMap({ q: ' mix ', categoria: '2', orden: 'precio_desc' })),
    ).toEqual({ q: 'mix', categoriaId: 2, orden: 'precio_desc' });
    expect(filtrosDesdeQuery(convertToParamMap({ categoria: 'abc', orden: 'nombre' }))).toEqual({
      q: '',
      categoriaId: null,
      orden: null,
    });
  });
});
