import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ITEMS } from '../../testing/catalogo-data';
import { agruparPorProducto } from '../../utils/catalogo.utils';
import { CatalogoProductCard } from './catalogo-product-card';

describe('CatalogoProductCard', () => {
  let fixture: ComponentFixture<CatalogoProductCard>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const chip = (label: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('[aria-label="Presentaciones"] button')].find(
      (b) => b.textContent!.trim() === label,
    )!;
  const boton = (label: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(label),
    )!;

  const crear = (producto = agruparPorProducto(ITEMS)[0]) => {
    fixture = TestBed.createComponent(CatalogoProductCard);
    fixture.componentRef.setInput('producto', producto);
    fixture.detectChanges();
  };

  it('shows category, name, description and the price "Desde" the first presentation', () => {
    crear();

    expect(texto()).toContain('Chifles');
    expect(raiz().querySelector('h3')?.textContent).toContain('Chifle salado');
    expect(texto()).toContain('Plátano verde frito');
    expect(texto()).toMatch(/Desde\s*S\/ 5\.00/);
    expect(chip('250g').getAttribute('aria-pressed')).toBe('true');
  });

  it('changes price and promotion tag with the chosen presentation', () => {
    crear();
    expect(texto()).not.toContain('-10%');

    chip('1kg').click();
    fixture.detectChanges();

    expect(chip('1kg').getAttribute('aria-pressed')).toBe('true');
    expect(texto()).toMatch(/Precio\s*S\/ 16\.20/);
    expect(texto()).toContain('-10%');
  });

  it('crosses out and disables a presentation without stock', () => {
    const [chifle] = agruparPorProducto(ITEMS);
    crear({
      ...chifle,
      presentaciones: [
        { ...chifle.presentaciones[0], disponible: false },
        chifle.presentaciones[1],
      ],
    });

    expect(chip('250g').disabled).toBe(true);
    expect(chip('250g').className).toContain('line-through');
    // Arranca en la primera con stock.
    expect(chip('1kg').getAttribute('aria-pressed')).toBe('true');
  });

  it('asks to open the detail; "Agregar" waits for the cart', () => {
    crear();
    let abierto: number | undefined;
    fixture.componentInstance.verDetalle.subscribe((id) => (abierto = id));

    boton('Ver detalle').click();

    expect(abierto).toBe(10);
    expect(boton('Agregar').disabled).toBe(true);
  });
});
