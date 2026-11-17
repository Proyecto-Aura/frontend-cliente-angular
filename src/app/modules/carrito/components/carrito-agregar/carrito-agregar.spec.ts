import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { ProductoCatalogo } from '../../../catalogo/models/catalogo.model';
import { ITEMS } from '../../../catalogo/testing/catalogo-data';
import { agruparPorProducto } from '../../../catalogo/utils/catalogo.utils';
import { CarritoStore } from '../../services/carrito-store';
import { CarritoAgregar } from './carrito-agregar';

describe('CarritoAgregar (HU-B-006, RF-B18)', () => {
  const [CHIFLE] = agruparPorProducto(ITEMS);
  let fixture: ComponentFixture<CarritoAgregar>;
  let cerrado: boolean;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const opcion = (label: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('[role="radio"]')].find((b) =>
      b.textContent!.includes(label),
    )!;
  const botonAgregar = () =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes('Agregar ·'),
    )!;

  const crear = (producto: ProductoCatalogo, presentacionId: number | null = null) => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(CarritoAgregar);
    fixture.componentRef.setInput('producto', producto);
    fixture.componentRef.setInput('presentacionId', presentacionId);
    cerrado = false;
    fixture.componentInstance.cerrar.subscribe(() => (cerrado = true));
    fixture.detectChanges();
  };

  it('adds the chosen presentation and quantity to the cart', () => {
    crear(CHIFLE, 101);
    expect(opcion('250g').getAttribute('aria-checked')).toBe('true');

    opcion('1kg').click();
    fixture.detectChanges();
    raiz().querySelector<HTMLButtonElement>('[aria-label="Agregar uno"]')!.click();
    fixture.detectChanges();
    expect(botonAgregar().textContent).toContain('S/ 32.40');

    botonAgregar().click();

    expect(TestBed.inject(CarritoStore).items()).toEqual([
      expect.objectContaining({ presentacionId: 102, cantidad: 2 }),
    ]);
    expect(TestBed.inject(Avisos).actual()?.titulo).toBe('Chifle salado agregado');
    expect(cerrado).toBe(true);
  });

  it('shows a presentation without stock as "Agotado" and does not let choose it', () => {
    crear({
      ...CHIFLE,
      presentaciones: [
        { ...CHIFLE.presentaciones[0], disponible: false },
        CHIFLE.presentaciones[1],
      ],
    });

    expect(opcion('250g').disabled).toBe(true);
    expect(opcion('250g').textContent).toContain('Agotado');
    expect(opcion('1kg').getAttribute('aria-checked')).toBe('true');
  });
});
