import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutStepper, PasoCheckout } from './checkout-stepper';

describe('CheckoutStepper (HU-B-007)', () => {
  let fixture: ComponentFixture<CheckoutStepper>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const pasos = () => [...raiz().querySelectorAll('li')];
  const render = (paso: PasoCheckout) => {
    fixture = TestBed.createComponent(CheckoutStepper);
    fixture.componentRef.setInput('paso', paso);
    fixture.detectChanges();
  };

  it('lists the three steps of the purchase in order', () => {
    render(2);

    expect(pasos().map((p) => p.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
      '1Paso 1: Carrito',
      '2Paso 2: Datos de entrega',
      '3Paso 3: Pago',
    ]);
  });

  it('reads each step with its number for screen readers, hiding the visual badge', () => {
    render(2);

    expect(raiz().querySelectorAll('.sr-only')).toHaveLength(3);
    expect(raiz().querySelector('.sr-only')!.textContent).toBe('Paso 1: ');
    expect(raiz().querySelector('span.rounded-full')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks only the current step with aria-current', () => {
    render(2);

    const actuales = raiz().querySelectorAll('[aria-current="step"]');
    expect(actuales).toHaveLength(1);
    expect(actuales[0].textContent).toContain('Datos de entrega');
  });

  it('paints the finished and current steps red and the next ones gray', () => {
    render(2);

    const circulos = pasos().map((p) => p.querySelector('span.rounded-full')!.className);
    expect(circulos[0]).toContain('bg-primary');
    expect(circulos[1]).toContain('bg-primary');
    expect(circulos[2]).not.toContain('bg-primary');
  });

  it('moves to payment once the address is confirmed', () => {
    render(3);

    expect(raiz().querySelector('[aria-current="step"]')!.textContent).toContain('Pago');
    const circulos = pasos().map((p) => p.querySelector('span.rounded-full')!.className);
    expect(circulos.every((c) => c.includes('bg-primary'))).toBe(true);
  });
});
