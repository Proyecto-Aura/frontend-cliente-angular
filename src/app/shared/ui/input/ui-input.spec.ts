import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { UiInput } from './ui-input';

@Component({
  imports: [UiInput, ReactiveFormsModule],
  template: `
    <app-ui-input id="form" label="Correo" [formControl]="email" error="Correo inválido" />
    <app-ui-input id="sig" label="Nombre" [(value)]="nombre" />
  `,
})
class Host {
  readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly nombre = signal('Casa');
}

describe('UiInput', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, host: fixture.componentInstance, el };
  }

  it('no muestra el error mientras el control no está touched', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    expect(el.querySelector('#form')?.textContent).not.toContain('Correo inválido');
  });

  it('muestra el error al hacer markAllAsTouched desde el padre', async () => {
    const { fixture, host, el } = setup();
    host.email.markAsTouched();
    await fixture.whenStable();
    expect(el.querySelector('#form')?.textContent).toContain('Correo inválido');
  });

  it('propaga lo escrito al FormControl y lo oculta cuando es válido', async () => {
    const { fixture, host, el } = setup();
    host.email.markAsTouched();
    const input = el.querySelector<HTMLInputElement>('#form input')!;
    input.value = 'a@b.pe';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(host.email.value).toBe('a@b.pe');
    expect(el.querySelector('#form')?.textContent).not.toContain('Correo inválido');
  });

  it('funciona con un signal vía [(value)]', async () => {
    const { fixture, host, el } = setup();
    await fixture.whenStable();
    const input = el.querySelector<HTMLInputElement>('#sig input')!;
    expect(input.value).toBe('Casa');
    input.value = 'Oficina';
    input.dispatchEvent(new Event('input'));
    expect(host.nombre()).toBe('Oficina');
  });
});
