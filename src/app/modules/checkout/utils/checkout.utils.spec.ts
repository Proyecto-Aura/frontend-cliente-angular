import { itemCarrito, lineaResumen, resumenPedido } from '../testing/checkout-data';
import {
  DIRECCION_MAXIMA,
  componerDireccion,
  errorDeDireccion,
  firmaDelPedido,
  itemsDelPedido,
  lineasDelPedido,
  tokenSimulado,
} from './checkout.utils';

describe('checkout.utils (HU-B-007, HU-B-008)', () => {
  describe('tokenSimulado (HU-B-008)', () => {
    it('builds an approved token that carries the payment method', () => {
      expect(tokenSimulado('aprobado', 'yape')).toMatch(/^tkn_sim_ok_yape_[0-9a-f]{16}$/);
    });

    it('builds a rejected token', () => {
      expect(tokenSimulado('rechazado', 'tarjeta')).toMatch(/^tkn_sim_ko_tarjeta_[0-9a-f]{16}$/);
    });

    it('gives a different token each time and fits the 100 characters the backend accepts', () => {
      const a = tokenSimulado('aprobado', 'plin');
      const b = tokenSimulado('aprobado', 'plin');

      expect(a).not.toBe(b);
      expect(a.length).toBeLessThanOrEqual(100);
    });
  });

  describe('itemsDelPedido', () => {
    it('sends only the lines that can be bought', () => {
      const items = [
        itemCarrito({ presentacionId: 101, cantidad: 3 }),
        itemCarrito({ presentacionId: 102, disponible: false }),
      ];

      expect(itemsDelPedido(items)).toEqual([{ producto_presentacion_id: 101, cantidad: 3 }]);
    });

    it('returns nothing for an empty cart', () => {
      expect(itemsDelPedido([])).toEqual([]);
    });
  });

  describe('firmaDelPedido', () => {
    const base = [itemCarrito({ presentacionId: 101, cantidad: 2 })];

    it('changes when the quantity changes', () => {
      const otra = [itemCarrito({ presentacionId: 101, cantidad: 3 })];

      expect(firmaDelPedido(otra)).not.toBe(firmaDelPedido(base));
    });

    it('changes when a line is added or removed', () => {
      const con = [...base, itemCarrito({ presentacionId: 102 })];

      expect(firmaDelPedido(con)).not.toBe(firmaDelPedido(base));
      expect(firmaDelPedido([])).not.toBe(firmaDelPedido(base));
    });

    it('ignores price changes: the server recalculates them anyway', () => {
      const masCaro = [
        itemCarrito({ presentacionId: 101, cantidad: 2, precio: 9, precioFinal: 9 }),
      ];

      expect(firmaDelPedido(masCaro)).toBe(firmaDelPedido(base));
    });

    it('ignores lines that are not available', () => {
      const con = [...base, itemCarrito({ presentacionId: 102, disponible: false })];

      expect(firmaDelPedido(con)).toBe(firmaDelPedido(base));
    });
  });

  describe('componerDireccion', () => {
    it('trims the address', () => {
      expect(componerDireccion('  Av. Larco 1232  ', '')).toBe('Av. Larco 1232');
    });

    it('appends the reference when there is one', () => {
      expect(componerDireccion('Av. Larco 1232', ' Frente al parque ')).toBe(
        'Av. Larco 1232 · Ref: Frente al parque',
      );
    });
  });

  describe('errorDeDireccion', () => {
    it('accepts a normal address', () => {
      expect(errorDeDireccion('Av. Larco 1232', '')).toBeNull();
    });

    it('asks for an address when it is empty or too short', () => {
      expect(errorDeDireccion('', '')).toBe('Ingresa la dirección de entrega.');
      expect(errorDeDireccion('  Av. ', '')).toBe('Ingresa la dirección de entrega.');
    });

    it('accepts exactly the minimum length', () => {
      expect(errorDeDireccion('Av. 12', '')).toBeNull();
    });

    it('rejects an address plus reference longer than the backend allows', () => {
      const larga = 'a'.repeat(DIRECCION_MAXIMA - 5);

      expect(errorDeDireccion(larga, 'x'.repeat(20))).toBe(
        'La dirección y la referencia son demasiado largas.',
      );
      expect(errorDeDireccion(larga, '')).toBeNull();
    });
  });

  describe('lineasDelPedido', () => {
    it('joins what the server calculated with the cart data', () => {
      const items = [itemCarrito({ presentacionId: 101, imagenUrl: 'https://img/a.png' })];
      const resumen = resumenPedido({
        items: [
          lineaResumen({
            producto_presentacion_id: 101,
            cantidad: 30,
            precio_aplicado: 4.2,
            es_mayorista: true,
            subtotal: 126,
          }),
        ],
      });

      expect(lineasDelPedido(items, resumen)).toEqual([
        {
          presentacionId: 101,
          nombre: 'Chifle salado',
          presentacion: '250g',
          imagenUrl: 'https://img/a.png',
          cantidad: 30,
          precioUnitario: 5,
          precioAplicado: 4.2,
          esMayorista: true,
          subtotal: 126,
        },
      ]);
    });

    it('uses the quantity from the server, not the one from the cart', () => {
      const items = [itemCarrito({ presentacionId: 101, cantidad: 2 })];
      const resumen = resumenPedido({
        items: [lineaResumen({ producto_presentacion_id: 101, cantidad: 5 })],
      });

      expect(lineasDelPedido(items, resumen)[0].cantidad).toBe(5);
    });

    it('returns nothing before the summary arrives', () => {
      expect(lineasDelPedido([itemCarrito({ presentacionId: 101 })], null)).toEqual([]);
    });

    it('skips a line the cart no longer has', () => {
      const resumen = resumenPedido({
        items: [lineaResumen({ producto_presentacion_id: 999 })],
      });

      expect(lineasDelPedido([itemCarrito({ presentacionId: 101 })], resumen)).toEqual([]);
    });
  });
});
