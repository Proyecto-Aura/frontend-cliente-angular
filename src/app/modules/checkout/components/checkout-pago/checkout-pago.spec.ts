import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPago } from './checkout-pago';

describe('CheckoutPago (HU-B-008, RF-B24)', () => {
  let fixture: ComponentFixture<CheckoutPago>;

  const texto = () => (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutPago);
    fixture.detectChanges();
  });

  it('presents online payment with Culqi as the way to pay', () => {
    expect(texto()).toContain('Método de pago');
    expect(texto()).toContain('Pago en línea con Culqi');
  });

  it('lists card, Yape and Plin', () => {
    const medios = [...(fixture.nativeElement as HTMLElement).querySelectorAll('li')].map((li) =>
      li.textContent!.trim(),
    );

    expect(medios).toEqual(['Tarjeta', 'Yape', 'Plin']);
  });

  it('tells the client the order is only registered once the payment is confirmed', () => {
    expect(texto()).toContain('Tu pedido se registra solo cuando el pago se confirma');
  });
});
