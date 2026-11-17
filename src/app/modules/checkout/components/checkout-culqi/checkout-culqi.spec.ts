import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutCulqi } from './checkout-culqi';

describe('CheckoutCulqi (HU-B-008, RF-B24)', () => {
  let fixture: ComponentFixture<CheckoutCulqi>;
  /** Tokens que emitió el componente y veces que pidió cerrarse. */
  let tokens: string[];
  let cierres: number;

  const raiz = () => fixture.nativeElement as HTMLElement;
  // Separa con un espacio el texto de elementos contiguos ("Total a pagar" y su monto).
  const texto = () =>
    raiz()
      .innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  const boton = (t: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(t),
    )!;
  const medio = (valor: string) =>
    raiz().querySelector<HTMLInputElement>(`input[value="${valor}"]`)!;

  const render = (opciones: { procesando?: boolean; error?: string | null } = {}) => {
    fixture = TestBed.createComponent(CheckoutCulqi);
    fixture.componentRef.setInput('total', 165.6);
    fixture.componentRef.setInput('procesando', opciones.procesando ?? false);
    fixture.componentRef.setInput('error', opciones.error ?? null);
    tokens = [];
    cierres = 0;
    fixture.componentInstance.pagar.subscribe((token) => tokens.push(token));
    fixture.componentInstance.cerrar.subscribe(() => cierres++);
    fixture.detectChanges();
  };

  it('is an accessible dialog that shows the total to pay', () => {
    render();

    const dialogo = raiz().querySelector('[role="dialog"]')!;
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(dialogo.getAttribute('aria-labelledby')).toBe('culqi-titulo');
    expect(raiz().querySelector('#culqi-titulo')!.textContent).toContain('Pagar con Culqi');
    expect(texto()).toContain('Total a pagar S/ 165.60');
  });

  it('says it is a demonstration and asks for no card data', () => {
    render();

    expect(texto()).toContain('Modo demostración');
    expect(texto()).toContain('No se realiza ningún cargo');
    expect(
      raiz().querySelectorAll('input[type="text"], input[type="number"], input[type="tel"]'),
    ).toHaveLength(0);
  });

  it('offers card, Yape and Plin, with the card selected', () => {
    render();

    expect([...raiz().querySelectorAll('label')].map((l) => l.textContent!.trim())).toEqual([
      'Tarjeta',
      'Yape',
      'Plin',
    ]);
    expect(medio('tarjeta').checked).toBe(true);
    expect(raiz().querySelector('fieldset legend')!.textContent).toContain('Elige cómo pagar');
  });

  it('approves with a token that carries the chosen method (RF-B24)', () => {
    render();

    medio('plin').click();
    fixture.detectChanges();
    boton('Simular pago aprobado').click();

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatch(/^tkn_sim_ok_plin_[0-9a-f]{16}$/);
  });

  it('rejects with a token the backend turns down (RF-B26)', () => {
    render();

    boton('Simular pago rechazado').click();

    expect(tokens[0]).toMatch(/^tkn_sim_ko_tarjeta_[0-9a-f]{16}$/);
  });

  it('shows the reason of a rejection and keeps the buttons on to retry (RF-B27)', () => {
    render({ error: 'El pago fue rechazado (simulación).' });

    const alerta = raiz().querySelector('[role="alert"]')!;
    expect(alerta.textContent).toContain('Pago rechazado');
    expect(alerta.textContent).toContain('El pago fue rechazado (simulación).');
    expect(alerta.textContent).toContain('No se creó ningún pedido');
    expect(boton('Simular pago aprobado').disabled).toBe(false);
  });

  it('shows no alert when there is no error', () => {
    render();

    expect(raiz().querySelector('[role="alert"]')).toBeNull();
  });

  it('locks everything while the payment is processed', () => {
    render({ procesando: true });

    expect(boton('Procesando pago').disabled).toBe(true);
    expect(boton('Simular pago rechazado').disabled).toBe(true);
    expect(boton('Volver').disabled).toBe(true);
    expect(raiz().querySelector('fieldset')!.disabled).toBe(true);

    boton('Procesando pago').click();
    expect(tokens).toHaveLength(0);
  });

  it('closes with "Volver", with the X, with Escape and with a click outside', () => {
    render();

    boton('Volver').click();
    raiz().querySelector<HTMLButtonElement>('[aria-label="Cerrar"]')!.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    (fixture.nativeElement as HTMLElement).click();

    expect(cierres).toBe(4);
  });

  it('does not close with Escape or a click outside while it is charging', () => {
    render({ procesando: true });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    (fixture.nativeElement as HTMLElement).click();

    expect(cierres).toBe(0);
  });

  it('does not close when the click lands inside the window', () => {
    render();

    raiz().querySelector<HTMLElement>('[role="dialog"]')!.click();

    expect(cierres).toBe(0);
  });
});
