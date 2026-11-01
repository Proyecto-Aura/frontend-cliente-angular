import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PerfilCliente } from '../../../cuenta/models/perfil.model';
import { PERFIL } from '../../testing/checkout-data';
import { CheckoutCliente } from './checkout-cliente';

describe('CheckoutCliente (HU-B-007)', () => {
  let fixture: ComponentFixture<CheckoutCliente>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const render = (perfil: PerfilCliente | null) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(CheckoutCliente);
    fixture.componentRef.setInput('perfil', perfil);
    fixture.detectChanges();
  };

  it('shows the full name and phone taken from the profile', () => {
    render(PERFIL);

    expect(texto()).toContain('Datos del cliente');
    expect(texto()).toContain('Rosa Elena Quispe Huamán');
    expect(texto()).toContain('987654321');
  });

  it('says so when the client has no phone', () => {
    render({ ...PERFIL, telefono: null });

    expect(texto()).toContain('No registrado');
  });

  it('skips an empty second last name', () => {
    render({ ...PERFIL, apellido_materno: '' });

    expect(texto()).toContain('Rosa Elena Quispe');
    expect(texto()).not.toContain('Quispe  ');
  });

  it('shows placeholders while the profile loads', () => {
    render(null);

    expect(raiz().querySelectorAll('[aria-label="Cargando"]')).toHaveLength(2);
    expect(texto()).not.toContain('No registrado');
  });

  it('links to My profile to fix the data', () => {
    render(PERFIL);

    const enlace = raiz().querySelector<HTMLAnchorElement>('a')!;
    expect(enlace.textContent).toContain('Mi perfil');
    expect(enlace.getAttribute('href')).toBe('/mi-cuenta/perfil');
  });
});
