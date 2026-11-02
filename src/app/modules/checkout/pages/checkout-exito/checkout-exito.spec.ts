import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { PedidoPagado } from '../../models/checkout.model';
import { CheckoutExito } from './checkout-exito';

describe('CheckoutExito (HU-B-008, RF-B26 y RF-B28)', () => {
  const PEDIDO: PedidoPagado = {
    id: 7,
    codigo: 'PED-000007',
    estado: 'confirmado',
    tipo_entrega: 'delivery',
    direccion_entrega: 'Av. Los Girasoles 123 · Ref: puerta verde',
    total: 165.6,
    items: [
      {
        producto_presentacion_id: 10,
        producto: 'Chifles salados',
        presentacion: '250g',
        cantidad: 30,
        precio_aplicado: 4.2,
        subtotal: 126,
      },
      {
        producto_presentacion_id: 11,
        producto: 'Canchita serrana',
        presentacion: '1kg',
        cantidad: 4,
        precio_aplicado: 9.9,
        subtotal: 39.6,
      },
    ],
    pago: {
      metodo_pago: 'culqi',
      monto: 165.6,
      numero_operacion: 'chr_sim_abc123',
      fecha_pago: '2026-11-02T10:00:00Z',
    },
  };

  let fixture: ComponentFixture<CheckoutExito>;
  let navegar: ReturnType<typeof vi.spyOn>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () =>
    raiz()
      .innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  const abrir = (estado: unknown) => {
    history.replaceState(estado, '');
    fixture = TestBed.createComponent(CheckoutExito);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => history.replaceState(null, ''));

  it('confirms the payment and shows the order as paid (RF-B26, RF-B28)', () => {
    abrir({ pedido: PEDIDO });

    expect(raiz().querySelector('h1')!.textContent).toContain('¡Pago confirmado!');
    expect(texto()).toContain('Tu pedido PED-000007 quedó registrado como Pagado');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('lists each line with the price that was charged, wholesale included', () => {
    abrir({ pedido: PEDIDO });

    expect(raiz().querySelectorAll('li')).toHaveLength(2);
    expect(texto()).toContain('Chifles salados · 250g · 30 × S/ 4.20');
    expect(texto()).toContain('S/ 126.00');
    expect(texto()).toContain('Canchita serrana · 1kg · 4 × S/ 9.90');
  });

  it('shows where it is delivered, how it was paid and the total', () => {
    abrir({ pedido: PEDIDO });

    expect(texto()).toContain('Entrega en Av. Los Girasoles 123 · Ref: puerta verde');
    expect(texto()).toContain('Medio de pago Culqi');
    expect(texto()).toContain('N.º de operación chr_sim_abc123');
    expect(texto()).toContain('Total pagado S/ 165.60');
  });

  it('hides the delivery address and the operation number when there are none', () => {
    abrir({
      pedido: {
        ...PEDIDO,
        tipo_entrega: 'recojo_tienda',
        direccion_entrega: null,
        pago: { ...PEDIDO.pago!, numero_operacion: null },
      },
    });

    expect(texto()).not.toContain('Entrega en');
    expect(texto()).not.toContain('N.º de operación');
  });

  it('lets the client keep shopping', () => {
    abrir({ pedido: PEDIDO });

    const enlace = [...raiz().querySelectorAll<HTMLAnchorElement>('a')].find((a) =>
      a.textContent!.includes('Seguir comprando'),
    )!;
    expect(enlace.getAttribute('href')).toBe('/catalogo');
  });

  it('goes back to the catalog when it is opened without an order', () => {
    abrir(null);

    expect(navegar).toHaveBeenCalledWith(['/catalogo'], { replaceUrl: true });
    expect(raiz().querySelector('h1')).toBeNull();
  });

  it('ignores a navigation state that is not an order', () => {
    abrir({ pedido: { algo: 'raro' } });

    expect(navegar).toHaveBeenCalledWith(['/catalogo'], { replaceUrl: true });
  });
});
