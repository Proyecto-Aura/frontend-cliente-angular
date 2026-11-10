import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { PedidoPagado } from '../../models/checkout.model';
import { CheckoutExito } from './checkout-exito';

describe('CheckoutExito (HU-B-013, RF-B37; HU-B-008)', () => {
  const URL = `${environment.apiUrl}/portal/pedidos/7`;
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
  let httpMock: HttpTestingController;
  // Doble de la ruta activa: el id se fija en cada prueba antes de crear la pantalla.
  const ruta = { snapshot: { paramMap: convertToParamMap({}) } };

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () =>
    raiz()
      .innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  const boton = (nombre: string) =>
    [...raiz().querySelectorAll('button')].find((b) => b.textContent!.includes(nombre));

  /** Abre la pantalla de un pedido; el id viene de la ruta, como en la app. */
  const abrir = (id: string) => {
    ruta.snapshot = { paramMap: convertToParamMap({ id }) };
    fixture = TestBed.createComponent(CheckoutExito);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: ruta },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('asks the backend for the order of the route, not the navigation state (RF-B37)', () => {
    abrir('7');

    const req = httpMock.expectOne(URL);

    expect(req.request.method).toBe('GET');
    req.flush(PEDIDO);
  });

  it('shows a loading state while the order arrives', () => {
    abrir('7');

    expect(raiz().querySelector('[aria-label="Cargando tu pedido"]')).not.toBeNull();
    expect(raiz().querySelector('h1')).toBeNull();
    httpMock.expectOne(URL).flush(PEDIDO);
  });

  it('shows the status "Confirmado" once the payment is complete (RF-B37)', () => {
    abrir('7');
    httpMock.expectOne(URL).flush(PEDIDO);
    fixture.detectChanges();

    expect(raiz().querySelector('h1')!.textContent).toContain('¡Pedido confirmado!');
    expect(texto()).toContain('Tu pedido PED-000007 está Confirmado');
    expect(raiz().querySelector('[aria-label="Cargando tu pedido"]')).toBeNull();
  });

  it('does not say "Confirmado" for an order in another status', () => {
    abrir('7');
    httpMock.expectOne(URL).flush({ ...PEDIDO, estado: 'en_camino' });
    fixture.detectChanges();

    expect(raiz().querySelector('h1')!.textContent).toContain('Estado de tu pedido');
    expect(texto()).toContain('está en camino');
    expect(texto()).not.toContain('Confirmado');
  });

  it('lists each line with the price that was charged, wholesale included', () => {
    abrir('7');
    httpMock.expectOne(URL).flush(PEDIDO);
    fixture.detectChanges();

    expect(raiz().querySelectorAll('li')).toHaveLength(2);
    expect(texto()).toContain('Chifles salados · 250g · 30 × S/ 4.20');
    expect(texto()).toContain('S/ 126.00');
    expect(texto()).toContain('Canchita serrana · 1kg · 4 × S/ 9.90');
  });

  it('shows where it is delivered, how it was paid and the total', () => {
    abrir('7');
    httpMock.expectOne(URL).flush(PEDIDO);
    fixture.detectChanges();

    expect(texto()).toContain('Entrega en Av. Los Girasoles 123 · Ref: puerta verde');
    expect(texto()).toContain('Medio de pago Culqi');
    expect(texto()).toContain('N.º de operación chr_sim_abc123');
    expect(texto()).toContain('Total pagado S/ 165.60');
  });

  it('hides the delivery address and the operation number when there are none', () => {
    abrir('7');
    httpMock.expectOne(URL).flush({
      ...PEDIDO,
      tipo_entrega: 'recojo_tienda',
      direccion_entrega: null,
      pago: { ...PEDIDO.pago!, numero_operacion: null },
    });
    fixture.detectChanges();

    expect(texto()).not.toContain('Entrega en');
    expect(texto()).not.toContain('N.º de operación');
  });

  describe('receipt (HU-B-010, RF-B30, RF-B31)', () => {
    const comprobante = () =>
      raiz().querySelector('[data-testid="comprobante"]')!.textContent!.replace(/\s+/g, ' ').trim();
    const aviso = () => raiz().querySelector('[data-testid="aviso-comprobante"]');
    const conComprobante = (c: NonNullable<NonNullable<PedidoPagado['pago']>['comprobante']>) => ({
      ...PEDIDO,
      pago: { ...PEDIDO.pago!, comprobante: c },
    });
    const BOLETA = {
      tipo: 'boleta' as const,
      codigo: 'B001-00000015',
      serie: 'B001',
      numero: 15,
      ruc: null,
      razon_social: null,
      subtotal: 165.6,
      total: 165.6,
      fecha_emision: '2026-11-10T15:00:00Z',
    };

    it('shows the issued boleta and says it was sent by email', () => {
      abrir('7');
      httpMock.expectOne(URL).flush(conComprobante(BOLETA));
      fixture.detectChanges();

      expect(comprobante()).toBe('Boleta B001-00000015');
      expect(aviso()!.textContent).toContain('Te enviamos tu boleta a tu correo.');
    });

    it('shows the factura with the RUC and business name', () => {
      abrir('7');
      httpMock.expectOne(URL).flush(
        conComprobante({
          ...BOLETA,
          tipo: 'factura',
          codigo: 'F001-00000001',
          serie: 'F001',
          numero: 1,
          ruc: '20601234565',
          razon_social: 'Distribuidora Andina S.A.C.',
        }),
      );
      fixture.detectChanges();

      expect(comprobante()).toBe(
        'Factura F001-00000001 RUC 20601234565 · Distribuidora Andina S.A.C.',
      );
      expect(aviso()!.textContent).toContain('Te enviamos tu factura a tu correo.');
    });

    it('says it is pending when the server could not issue it yet', () => {
      abrir('7');
      httpMock.expectOne(URL).flush(conComprobante(null as never));
      fixture.detectChanges();

      expect(comprobante()).toBe('Pendiente de emisión');
      expect(aviso()).toBeNull();
    });
  });

  it('lets the client keep shopping', () => {
    abrir('7');
    httpMock.expectOne(URL).flush(PEDIDO);
    fixture.detectChanges();

    const enlace = [...raiz().querySelectorAll<HTMLAnchorElement>('a')].find((a) =>
      a.textContent!.includes('Seguir comprando'),
    )!;
    expect(enlace.getAttribute('href')).toBe('/catalogo');
  });

  it('says the order was not found when it does not exist or is not the client’s (404)', () => {
    abrir('7');
    httpMock
      .expectOne(URL)
      .flush({ message: 'Pedido no encontrado' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(raiz().querySelector('h1')!.textContent).toContain('Pedido no encontrado');
    expect(raiz().querySelector('[role="alert"]')).not.toBeNull();
    expect(boton('Reintentar')).toBeUndefined();
    expect(texto()).not.toContain('Confirmado');
  });

  it('does not call the backend with an id that is not a number', () => {
    abrir('abc');
    fixture.detectChanges();

    httpMock.expectNone(() => true);
    expect(raiz().querySelector('h1')!.textContent).toContain('Pedido no encontrado');
  });

  it('shows the server error and lets the client retry (RF-B37)', () => {
    abrir('7');
    httpMock
      .expectOne(URL)
      .flush({ message: 'Fallo interno' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="alert"]')).not.toBeNull();
    expect(raiz().querySelector('h1')).toBeNull();

    boton('Reintentar')!.click();
    fixture.detectChanges();
    httpMock.expectOne(URL).flush(PEDIDO);
    fixture.detectChanges();

    expect(texto()).toContain('Tu pedido PED-000007 está Confirmado');
    expect(raiz().querySelector('[role="alert"]')).toBeNull();
  });
});
