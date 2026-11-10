import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComprobante } from './checkout-comprobante';

describe('CheckoutComprobante (HU-B-009, RF-B29)', () => {
  let fixture: ComponentFixture<CheckoutComprobante>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  // Separa con un espacio el texto de elementos contiguos ("Boleta" y su detalle).
  const texto = () =>
    raiz()
      .innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  const campo = (id: string) => raiz().querySelector<HTMLInputElement>(`#${id}`);
  const opcion = (valor: string) =>
    raiz().querySelector<HTMLInputElement>(`input[type="radio"][value="${valor}"]`)!;
  const entrada = (nombre: string, valor: unknown) => {
    fixture.componentRef.setInput(nombre, valor);
    fixture.detectChanges();
  };
  const escribir = (id: string, valor: string) => {
    campo(id)!.value = valor;
    campo(id)!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const salir = (id: string) => {
    campo(id)!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComprobante);
    fixture.detectChanges();
  });

  it('shows both options with the prototype texts inside a labelled radio group', () => {
    const grupo = raiz().querySelector('[role="radiogroup"]')!;

    expect(grupo.getAttribute('aria-labelledby')).toBe('co-comp-titulo');
    expect(raiz().querySelector('#co-comp-titulo')!.textContent).toContain('Comprobante de pago');
    expect(texto()).toContain('Boleta Para personas naturales');
    expect(texto()).toContain('Factura Para empresas con RUC');
    expect(opcion('boleta').checked).toBe(true);
  });

  it('chooses factura and shows the RUC and business name fields with their labels', () => {
    opcion('factura').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.tipo()).toBe('factura');
    expect(raiz().querySelector('label[for="co-ruc"]')!.textContent).toContain('RUC');
    expect(raiz().querySelector('label[for="co-razon"]')!.textContent).toContain('Razón social');
    expect(campo('co-ruc')!.getAttribute('inputmode')).toBe('numeric');
    expect(campo('co-ruc')!.maxLength).toBe(11);
  });

  it('keeps boleta free of extra fields', () => {
    entrada('tipo', 'boleta');

    expect(campo('co-ruc')).toBeNull();
    expect(campo('co-razon')).toBeNull();
  });

  it('updates the RUC and business name the client types', () => {
    entrada('tipo', 'factura');

    escribir('co-ruc', '20601234565');
    escribir('co-razon', 'Empresa S.A.C.');

    expect(fixture.componentInstance.ruc()).toBe('20601234565');
    expect(fixture.componentInstance.razonSocial()).toBe('Empresa S.A.C.');
  });

  it('does not show errors before the client leaves the field', () => {
    entrada('tipo', 'factura');

    escribir('co-ruc', '206');

    expect(texto()).not.toContain('El RUC debe tener 11 dígitos.');

    salir('co-ruc');

    expect(texto()).toContain('El RUC debe tener 11 dígitos.');
    expect(campo('co-ruc')!.getAttribute('aria-describedby')).toBe('co-ruc-error');
  });

  it('shows every error when asked to (the client tried to pay)', () => {
    entrada('tipo', 'factura');

    entrada('mostrarErrores', true);

    expect(texto()).toContain('Ingresa el RUC.');
    expect(texto()).toContain('Ingresa la razón social.');
    expect(campo('co-razon')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows no errors with valid data', () => {
    entrada('tipo', 'factura');
    entrada('mostrarErrores', true);

    escribir('co-ruc', '20601234565');
    escribir('co-razon', 'Empresa S.A.C.');

    expect(raiz().querySelectorAll('.text-destructive')).toHaveLength(0);
    expect(campo('co-ruc')!.getAttribute('aria-invalid')).toBe('false');
  });

  it('shows the server error as an alert', () => {
    entrada('errorServidor', 'comprobante.ruc no es un RUC válido');

    expect(raiz().querySelector('[role="alert"]')!.textContent).toContain(
      'comprobante.ruc no es un RUC válido',
    );
  });

  it('cannot be changed while locked', () => {
    entrada('tipo', 'factura');
    entrada('bloqueado', true);

    expect(opcion('boleta').disabled).toBe(true);
    expect(campo('co-ruc')!.disabled).toBe(true);
    expect(campo('co-razon')!.disabled).toBe(true);
  });
});
