import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { ITEMS } from '../../../catalogo/testing/catalogo-data';
import { agruparPorProducto } from '../../../catalogo/utils/catalogo.utils';
import { CarritoStore } from '../../services/carrito-store';
import { CarritoDrawer } from './carrito-drawer';

describe('CarritoDrawer (HU-B-006, RF-B19)', () => {
  const [CHIFLE] = agruparPorProducto(ITEMS);
  let fixture: ComponentFixture<CarritoDrawer>;
  let carrito: CarritoStore;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const lineas = () => [...raiz().querySelectorAll('app-carrito-item')];

  const crear = () => {
    fixture = TestBed.createComponent(CarritoDrawer);
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    carrito = TestBed.inject(CarritoStore);
    carrito.abierto.set(true);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows an empty cart with a way back to the catalog', () => {
    crear();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    expect(texto()).toContain('Tu carrito está vacío');
    raiz().querySelector<HTMLButtonElement>('aside button:not([aria-label])')!.click();

    expect(carrito.abierto()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/catalogo']);
  });

  it('lists the lines with their totals and refreshes them when opened', () => {
    carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 2);
    carrito.agregar(CHIFLE, CHIFLE.presentaciones[1], 1);
    crear();
    httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/10`).flush(CHIFLE);
    fixture.detectChanges();

    expect(lineas()).toHaveLength(2);
    expect(texto()).toContain('Subtotal (3 productos)');
    expect(texto()).toContain('S/ 28.00');
    expect(texto()).toContain('- S/ 1.80');
    expect(texto()).toContain('S/ 26.20');
  });

  it('changes quantities and removes lines (RF-B19)', () => {
    carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 1);
    crear();
    httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/10`).flush(CHIFLE);
    fixture.detectChanges();

    raiz().querySelector<HTMLButtonElement>('[aria-label="Agregar uno"]')!.click();
    fixture.detectChanges();
    expect(carrito.items()[0].cantidad).toBe(2);
    expect(texto()).toContain('S/ 10.00');

    raiz().querySelector<HTMLButtonElement>('[aria-label="Eliminar Chifle salado"]')!.click();
    fixture.detectChanges();
    expect(carrito.items()).toEqual([]);
    expect(texto()).toContain('Tu carrito está vacío');
  });

  it('"Finalizar compra" closes the panel and goes to the checkout (HU-B-007)', () => {
    carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 1);
    crear();
    httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/10`).flush(CHIFLE);
    fixture.detectChanges();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const finalizar = [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes('Finalizar compra'),
    )!;
    expect(finalizar.disabled).toBe(false);
    finalizar.click();

    expect(carrito.abierto()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/checkout']);
  });

  it('"Finalizar compra" stays off when nothing in the cart can be bought', () => {
    carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 1);
    crear();
    httpMock
      .expectOne(`${environment.apiUrl}/catalogo/productos/10`)
      .flush({ message: 'x' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const finalizar = [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes('Finalizar compra'),
    )!;
    expect(lineas()).toHaveLength(1);
    expect(finalizar.disabled).toBe(true);
  });

  it('closes with the X button', () => {
    crear();

    raiz().querySelector<HTMLButtonElement>('[aria-label="Cerrar carrito"]')!.click();

    expect(carrito.abierto()).toBe(false);
  });
});
