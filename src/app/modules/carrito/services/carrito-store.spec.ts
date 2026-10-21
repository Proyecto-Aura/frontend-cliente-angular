import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { ITEMS } from '../../catalogo/testing/catalogo-data';
import { agruparPorProducto } from '../../catalogo/utils/catalogo.utils';
import { CarritoGuardado } from '../models/carrito.model';
import { CANTIDAD_MAXIMA, CarritoStore, DIAS_VIGENCIA_CARRITO } from './carrito-store';

describe('CarritoStore (HU-B-006)', () => {
  const CLAVE = 'francos.carrito';
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  const [CHIFLE, MIX] = agruparPorProducto(ITEMS);
  const [CHIFLE_250, CHIFLE_1KG] = CHIFLE.presentaciones;

  let carrito: CarritoStore;

  const crear = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    carrito = TestBed.inject(CarritoStore);
  };
  const guardado = () => JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as CarritoGuardado;

  beforeEach(() => localStorage.clear());

  it('adds a presentation and keeps it in localStorage (RF-B18)', () => {
    crear();

    expect(carrito.agregar(CHIFLE, CHIFLE_1KG, 2)).toBe(true);

    expect(carrito.items()).toEqual([
      expect.objectContaining({
        presentacionId: 102,
        nombre: 'Chifle salado',
        presentacion: '1kg',
        precio: 18,
        precioFinal: 16.2,
        promocion: '-10%',
        cantidad: 2,
      }),
    ]);
    expect(guardado().items).toHaveLength(1);
    expect(carrito.unidades()).toBe(2);
  });

  it('adds up on the same presentation, up to the maximum', () => {
    crear();
    carrito.agregar(CHIFLE, CHIFLE_250, 1);
    carrito.agregar(CHIFLE, CHIFLE_250, 2);
    expect(carrito.items()).toEqual([expect.objectContaining({ cantidad: 3 })]);

    carrito.agregar(CHIFLE, CHIFLE_250, 500);
    expect(carrito.items()[0].cantidad).toBe(CANTIDAD_MAXIMA);
  });

  it('does not add a presentation without stock (RF-B18)', () => {
    crear();

    expect(carrito.agregar(MIX, MIX.presentaciones[0], 1)).toBe(false);
    expect(carrito.items()).toEqual([]);
  });

  it('changes quantities, removes lines and adds up the totals (RF-B19)', () => {
    crear();
    carrito.agregar(CHIFLE, CHIFLE_250, 1);
    carrito.agregar(CHIFLE, CHIFLE_1KG, 1);

    carrito.cambiarCantidad(102, 3);
    expect(carrito.subtotal()).toBeCloseTo(5 + 18 * 3);
    expect(carrito.descuento()).toBeCloseTo(1.8 * 3);
    expect(carrito.total()).toBeCloseTo(5 + 16.2 * 3);

    carrito.cambiarCantidad(102, 0);
    expect(carrito.items()[1].cantidad).toBe(1);

    carrito.eliminar(101);
    expect(carrito.items().map((i) => i.presentacionId)).toEqual([102]);
    carrito.eliminar(102);
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('keeps the cart after reloading the page', () => {
    crear();
    carrito.agregar(CHIFLE, CHIFLE_250, 2);

    TestBed.resetTestingModule();
    crear();

    expect(carrito.items()).toEqual([
      expect.objectContaining({ presentacionId: 101, cantidad: 2 }),
    ]);
  });

  it(`empties a cart nobody touched for more than ${DIAS_VIGENCIA_CARRITO} days`, () => {
    crear();
    carrito.agregar(CHIFLE, CHIFLE_250, 1);
    const viejo = {
      ...guardado(),
      actualizado: Date.now() - (DIAS_VIGENCIA_CARRITO + 1) * MS_POR_DIA,
    };
    localStorage.setItem(CLAVE, JSON.stringify(viejo));

    TestBed.resetTestingModule();
    crear();

    expect(carrito.items()).toEqual([]);
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('empties the cart when the client logs out', () => {
    localStorage.setItem('francos.access_token', 'jwt');
    crear();
    carrito.agregar(CHIFLE, CHIFLE_250, 1);
    TestBed.tick();

    TestBed.inject(Session).clear();
    TestBed.tick();

    expect(carrito.items()).toEqual([]);
  });

  it('refreshes price, promotion and stock, and marks what is no longer sold', async () => {
    crear();
    carrito.agregar(CHIFLE, CHIFLE_250, 1);
    carrito.agregar(CHIFLE, CHIFLE_1KG, 1);
    const antes = guardado().actualizado;
    const httpMock = TestBed.inject(HttpTestingController);

    const listo = firstValueFrom(carrito.refrescar());
    httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/10`).flush({
      ...CHIFLE,
      presentaciones: [{ ...CHIFLE_250, precio: 6, precio_final: 6, disponible: false }],
    });
    await listo;

    expect(carrito.items()).toEqual([
      expect.objectContaining({ presentacionId: 101, precio: 6, disponible: false }),
      expect.objectContaining({ presentacionId: 102, disponible: false }),
    ]);
    expect(carrito.subtotal()).toBe(0);
    expect(guardado().actualizado).toBe(antes);
    httpMock.verify();
  });
});
