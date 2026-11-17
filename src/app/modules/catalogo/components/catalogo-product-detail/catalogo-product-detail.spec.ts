import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { CarritoStore } from '../../../carrito/services/carrito-store';
import { ITEMS } from '../../testing/catalogo-data';
import { agruparPorProducto } from '../../utils/catalogo.utils';
import { CatalogoProductDetail } from './catalogo-product-detail';

describe('CatalogoProductDetail (HU-B-005, RF-B17)', () => {
  const DETALLE = `${environment.apiUrl}/catalogo/productos/10`;
  let fixture: ComponentFixture<CatalogoProductDetail>;
  let httpMock: HttpTestingController;
  let cerrado: boolean;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const chip = (label: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('[aria-label="Presentaciones"] button')].find(
      (b) => b.textContent!.trim() === label,
    )!;

  const responder = async (cuerpo: object | null, status = 200) => {
    TestBed.tick();
    httpMock
      .expectOne(DETALLE)
      .flush(cuerpo, status === 200 ? {} : { status, statusText: 'Error' });
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CatalogoProductDetail);
    fixture.componentRef.setInput('productoId', 10);
    cerrado = false;
    fixture.componentInstance.cerrar.subscribe(() => (cerrado = true));
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('shows the presentations with their prices and the active promotion', async () => {
    await responder(agruparPorProducto(ITEMS)[0]);

    expect(raiz().querySelector('[role="dialog"]')).not.toBeNull();
    expect(raiz().querySelector('h3')?.textContent).toContain('Chifle salado');
    expect(texto()).toContain('S/ 5.00');
    expect(texto()).toContain('S/ 5.00 c/u');

    chip('1kg').click();
    fixture.detectChanges();

    expect(texto()).toContain('S/ 16.20');
    expect(texto()).toMatch(/S\/ 16\.20 c\/u · antes\s*S\/ 18\.00/);
    expect(texto()).toContain('-10%');
    expect(texto()).toContain(
      'Semana del chifle: 10% de descuento en 1kg. Válida hasta el 31/10/2026.',
    );
  });

  it('adds the chosen presentation and quantity to the cart (HU-B-006)', async () => {
    await responder(agruparPorProducto(ITEMS)[0]);
    chip('1kg').click();
    fixture.detectChanges();
    raiz().querySelector<HTMLButtonElement>('[aria-label="Agregar uno"]')!.click();
    fixture.detectChanges();
    expect(texto()).toContain('S/ 32.40');

    [...raiz().querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent!.includes('Agregar al carrito'))!
      .click();

    expect(TestBed.inject(CarritoStore).items()).toEqual([
      expect.objectContaining({ presentacionId: 102, cantidad: 2 }),
    ]);
    expect(cerrado).toBe(true);
  });

  it('lets the client retry when the product cannot be loaded', async () => {
    await responder(null, 500);
    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar el producto',
    );

    raiz().querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await responder(agruparPorProducto(ITEMS)[0]);
    expect(raiz().querySelector('h3')?.textContent).toContain('Chifle salado');
  });

  it('closes with the button, Escape or a click on the backdrop, not inside', async () => {
    await responder(agruparPorProducto(ITEMS)[0]);

    raiz().querySelector<HTMLElement>('[role="dialog"]')!.click();
    expect(cerrado).toBe(false);

    raiz().click();
    expect(cerrado).toBe(true);

    cerrado = false;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cerrado).toBe(true);

    cerrado = false;
    raiz().querySelector<HTMLButtonElement>('[aria-label="Cerrar"]')!.click();
    expect(cerrado).toBe(true);
  });
});
