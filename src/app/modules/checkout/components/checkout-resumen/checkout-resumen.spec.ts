import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaPedido } from '../../models/checkout.model';
import { CheckoutResumen } from './checkout-resumen';

describe('CheckoutResumen (HU-B-007, RF-B22/RF-B23)', () => {
  const linea = (over: Partial<LineaPedido> & { presentacionId: number }): LineaPedido => ({
    nombre: 'Chifle salado',
    presentacion: '250g',
    imagenUrl: null,
    cantidad: 2,
    precioUnitario: 5,
    precioAplicado: 5,
    esMayorista: false,
    subtotal: 10,
    ...over,
  });
  let fixture: ComponentFixture<CheckoutResumen>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  // Separa con un espacio el texto de elementos contiguos ("Total" y su monto).
  const texto = () =>
    raiz()
      .innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  const render = (lineas: LineaPedido[], total: number, confirmada = false) => {
    fixture = TestBed.createComponent(CheckoutResumen);
    fixture.componentRef.setInput('lineas', lineas);
    fixture.componentRef.setInput('subtotal', total);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('direccionConfirmada', confirmada);
    fixture.detectChanges();
  };

  it('lists each line with its presentation, quantity, unit price and subtotal', () => {
    render([linea({ presentacionId: 101 })], 10);

    expect(texto()).toContain('Resumen del pedido');
    expect(texto()).toContain('Chifle salado');
    expect(texto()).toContain('250g · 2 × S/ 5.00');
    expect(raiz().querySelectorAll('li')).toHaveLength(1);
  });

  it('shows the subtotal and the total calculated by the server', () => {
    render([linea({ presentacionId: 101 }), linea({ presentacionId: 102, subtotal: 36.5 })], 46.5);

    expect(texto()).toContain('Subtotal (4 productos)');
    expect(texto()).toContain('S/ 46.50');
    expect(texto()).toContain('Total S/ 46.50');
    expect(texto()).toContain('Envío Gratis');
  });

  it('uses the singular for a single unit', () => {
    render([linea({ presentacionId: 101, cantidad: 1, subtotal: 5 })], 5);

    expect(texto()).toContain('Subtotal (1 producto)');
  });

  it('flags the wholesale price when the quantity passes the threshold (RN17)', () => {
    render(
      [
        linea({
          presentacionId: 101,
          cantidad: 30,
          precioAplicado: 4.2,
          esMayorista: true,
          subtotal: 126,
        }),
      ],
      126,
    );

    expect(texto()).toContain('250g · 30 × S/ 4.20');
    expect(texto()).toContain('Mayorista');
    expect(texto()).toContain('S/ 126.00');
  });

  it('does not flag lines that pay the regular price', () => {
    render([linea({ presentacionId: 101 })], 10);

    expect(texto()).not.toContain('Mayorista');
  });

  it('shows the product image, or a placeholder when it has none', () => {
    render(
      [
        linea({ presentacionId: 101, imagenUrl: 'https://img/a.png' }),
        linea({ presentacionId: 102, nombre: 'Maní', imagenUrl: null }),
      ],
      20,
    );

    expect(raiz().querySelector('img')!.getAttribute('alt')).toBe('Chifle salado');
    expect(texto()).toContain('Sin imagen');
  });

  it('keeps "Pagar" off until the address is confirmed, and says why (HU-B-008)', () => {
    render([linea({ presentacionId: 101 })], 10, false);

    const boton = raiz().querySelector<HTMLButtonElement>('button')!;
    expect(boton.textContent).toContain('Pagar S/ 10.00');
    expect(boton.disabled).toBe(true);
    expect(texto()).toContain('Confirma tu dirección de entrega para continuar');
  });

  it('turns "Pagar" on with the address confirmed and asks to pay when clicked (RF-B24)', () => {
    render([linea({ presentacionId: 101 })], 10, true);
    const pagar = vi.fn();
    fixture.componentInstance.pagar.subscribe(pagar);

    const boton = raiz().querySelector<HTMLButtonElement>('button')!;
    expect(boton.disabled).toBe(false);
    expect(texto()).toContain('Pagas en línea con Culqi: tarjeta, Yape o Plin');
    boton.click();

    expect(pagar).toHaveBeenCalledOnce();
  });

  it('turns "Pagar" off while a payment is being processed', () => {
    render([linea({ presentacionId: 101 })], 10, true);

    fixture.componentRef.setInput('pagando', true);
    fixture.detectChanges();

    expect(raiz().querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
  });

  it('asks to confirm the address first, then says how it is paid', () => {
    render([linea({ presentacionId: 101 })], 10, false);
    expect(texto()).toContain('Confirma tu dirección de entrega para continuar');

    fixture.componentRef.setInput('direccionConfirmada', true);
    fixture.detectChanges();

    expect(texto()).toContain('Pagas en línea con Culqi');
    expect(texto()).not.toContain('Confirma tu dirección');
  });

  it('shows the chosen receipt type, boleta by default (HU-B-009)', () => {
    render([linea({ presentacionId: 101 })], 10);
    expect(texto()).toContain('Comprobante Boleta');

    fixture.componentRef.setInput('comprobante', 'factura');
    fixture.detectChanges();

    expect(texto()).toContain('Comprobante Factura');
  });
});
