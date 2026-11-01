import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DIRECCION_MAXIMA } from '../../utils/checkout.utils';
import { CheckoutDireccion } from './checkout-direccion';

describe('CheckoutDireccion (HU-B-007, RF-B20/RF-B21)', () => {
  let fixture: ComponentFixture<CheckoutDireccion>;
  let confirmadas: string[];
  let deshechas: number;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const campo = (id: string) => raiz().querySelector<HTMLInputElement>(`#${id}`)!;
  const boton = (t: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(t),
    );
  const entrada = (nombre: string, valor: unknown) => {
    fixture.componentRef.setInput(nombre, valor);
    fixture.detectChanges();
  };
  const escribir = (id: string, valor: string) => {
    campo(id).value = valor;
    campo(id).dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const enviar = () => {
    raiz().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutDireccion);
    confirmadas = [];
    deshechas = 0;
    fixture.componentInstance.confirmar.subscribe((d) => confirmadas.push(d));
    fixture.componentInstance.deshacer.subscribe(() => deshechas++);
    fixture.detectChanges();
  });

  it('proposes the default address from the profile', () => {
    entrada('direccionPerfil', 'Av. Los Girasoles 123, San Miguel');

    expect(campo('co-dir').value).toBe('Av. Los Girasoles 123, San Miguel');
    expect(texto()).toContain('Dirección obtenida de tu perfil');
  });

  it('leaves the field empty when the profile has no address', () => {
    entrada('direccionPerfil', null);

    expect(campo('co-dir').value).toBe('');
  });

  it('does not overwrite an address the client already typed', () => {
    escribir('co-dir', 'Jr. Cusco 450');

    entrada('direccionPerfil', 'Av. Los Girasoles 123, San Miguel');

    expect(campo('co-dir').value).toBe('Jr. Cusco 450');
  });

  it('shows the delivery estimate and the free shipping notice', () => {
    expect(texto()).toContain('Entrega estimada: 2–3 días hábiles');
    expect(texto()).toContain('Envío gratuito en todos los pedidos');
  });

  it('confirms the profile address as it is', () => {
    entrada('direccionPerfil', 'Av. Los Girasoles 123, San Miguel');

    boton('Confirmar dirección')!.click();
    fixture.detectChanges();

    expect(confirmadas).toEqual(['Av. Los Girasoles 123, San Miguel']);
  });

  it('confirms an edited address with its reference', () => {
    entrada('direccionPerfil', 'Av. Los Girasoles 123');
    escribir('co-dir', 'Av. José Larco 1232, Int 402');
    escribir('co-ref', 'Frente al parque');

    enviar();

    expect(confirmadas).toEqual(['Av. José Larco 1232, Int 402 · Ref: Frente al parque']);
  });

  it('asks for an address instead of confirming an empty one', () => {
    enviar();

    expect(confirmadas).toEqual([]);
    expect(texto()).toContain('Ingresa la dirección de entrega.');
    expect(campo('co-dir').getAttribute('aria-invalid')).toBe('true');
  });

  it('rejects an address that is too short', () => {
    escribir('co-dir', 'Av. 1');

    enviar();

    expect(confirmadas).toEqual([]);
    expect(texto()).toContain('Ingresa la dirección de entrega.');
  });

  it('rejects an address plus reference that is too long', () => {
    escribir('co-dir', 'a'.repeat(DIRECCION_MAXIMA - 5));
    escribir('co-ref', 'b'.repeat(30));

    enviar();

    expect(confirmadas).toEqual([]);
    expect(texto()).toContain('demasiado largas');
  });

  it('clears the error as soon as the client types again', () => {
    enviar();
    expect(texto()).toContain('Ingresa la dirección de entrega.');

    escribir('co-dir', 'Av. José Larco 1232');

    expect(texto()).not.toContain('Ingresa la dirección de entrega.');
  });

  it('locks the fields and offers to undo once confirmed', () => {
    entrada('direccionPerfil', 'Av. Los Girasoles 123');

    entrada('confirmada', true);

    expect(campo('co-dir').disabled).toBe(true);
    expect(campo('co-ref').disabled).toBe(true);
    expect(texto()).toContain('Dirección confirmada');
    expect(boton('Confirmar dirección')).toBeUndefined();
    expect(boton('Deshacer')).toBeDefined();
  });

  it('undo emits so the client can change the address, and unlocks the fields', () => {
    entrada('direccionPerfil', 'Av. Los Girasoles 123');
    entrada('confirmada', true);

    boton('Deshacer')!.click();
    expect(deshechas).toBe(1);

    entrada('confirmada', false);
    expect(campo('co-dir').disabled).toBe(false);
    expect(campo('co-dir').value).toBe('Av. Los Girasoles 123');
    expect(boton('Confirmar dirección')).toBeDefined();
  });

  it('ignores a second submit while the server is validating', () => {
    entrada('direccionPerfil', 'Av. Los Girasoles 123');
    entrada('confirmando', true);

    enviar();

    expect(confirmadas).toEqual([]);
    expect(texto()).toContain('Confirmando…');
    expect(campo('co-dir').disabled).toBe(true);
    expect(boton('Confirmando…')!.getAttribute('aria-disabled')).toBe('true');
  });

  it('shows why the server did not accept the address', () => {
    entrada('errorServidor', 'Indica una dirección de entrega');

    expect(raiz().querySelector('[role="alert"]')!.textContent).toContain(
      'Indica una dirección de entrega',
    );
  });

  it('labels every field for assistive technology', () => {
    expect(raiz().querySelector('label[for="co-dir"]')).not.toBeNull();
    expect(raiz().querySelector('label[for="co-ref"]')).not.toBeNull();
  });
});
