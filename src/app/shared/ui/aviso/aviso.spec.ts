import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CarritoStore } from '../../../modules/carrito/services/carrito-store';
import { Aviso, Avisos } from './aviso';

describe('Aviso (toast flotante)', () => {
  let fixture: ComponentFixture<Aviso>;
  let avisos: Avisos;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const wrapper = () => raiz().querySelector<HTMLElement>('div.fixed');

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Aviso);
    avisos = TestBed.inject(Avisos);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('renders nothing while there is no active notice', () => {
    expect(wrapper()).toBeNull();
  });

  it('shows the title, description and tone once mostrar() is called', () => {
    avisos.mostrar('Pedido cancelado', 'Tu pedido PED-000007 fue cancelado.', 'error');
    fixture.detectChanges();

    expect(wrapper()?.textContent).toContain('Pedido cancelado');
    expect(wrapper()?.textContent).toContain('Tu pedido PED-000007 fue cancelado.');
    expect(wrapper()?.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('defaults to the success tone when none is given', () => {
    avisos.mostrar('Chifle salado agregado');
    fixture.detectChanges();

    expect(wrapper()?.querySelector('[role="status"]')).not.toBeNull();
  });

  it('shows the link when the notice carries one', () => {
    avisos.mostrar('Debes verificar tu correo', undefined, 'error', {
      etiqueta: 'Reenviar correo de verificación',
      ruta: '/auth/reenviar-verificacion',
      queryParams: { email: 'rosa@francos.test' },
    });
    fixture.detectChanges();

    const enlace = wrapper()!.querySelector('a')!;
    expect(enlace.textContent).toContain('Reenviar correo de verificación');
  });

  it('slides out and unmounts after the timers run out', () => {
    vi.useFakeTimers();
    avisos.mostrar('Pedido cancelado');
    fixture.detectChanges();
    expect(wrapper()).not.toBeNull();

    vi.advanceTimersByTime(4500);
    fixture.detectChanges();
    expect(wrapper()?.className).toContain('translate-x-[120%]');

    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(wrapper()).toBeNull();
  });

  it('closes when the cart drawer opens, so it does not stay hidden behind it', () => {
    avisos.mostrar('Chifle salado agregado');
    fixture.detectChanges();
    expect(wrapper()).not.toBeNull();

    TestBed.inject(CarritoStore).abierto.set(true);
    fixture.detectChanges();

    expect(avisos.visible()).toBe(false);
  });
});
