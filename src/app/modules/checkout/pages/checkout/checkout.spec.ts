import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { CarritoStore } from '../../../carrito/services/carrito-store';
import { ProductoCatalogo } from '../../../catalogo/models/catalogo.model';
import { ITEMS } from '../../../catalogo/testing/catalogo-data';
import { agruparPorProducto } from '../../../catalogo/utils/catalogo.utils';
import { ResumenPedido } from '../../models/checkout.model';
import { PERFIL, lineaResumen, resumenPedido } from '../../testing/checkout-data';
import { Checkout } from './checkout';

describe('Checkout (HU-B-007, RF-B20 a RF-B23)', () => {
  const PERFIL_URL = `${environment.apiUrl}/perfil`;
  const RESUMEN_URL = `${environment.apiUrl}/portal/pedidos/resumen`;
  const PRODUCTO_URL = `${environment.apiUrl}/catalogo/productos/10`;
  const [CHIFLE] = agruparPorProducto(ITEMS);
  const DIRECCION_PERFIL = 'Av. Los Girasoles 123, San Miguel';

  let fixture: ComponentFixture<Checkout>;
  let httpMock: HttpTestingController;
  let carrito: CarritoStore;

  const raiz = () => fixture.nativeElement as HTMLElement;
  // Separa con un espacio el texto de elementos contiguos ("Total" y su monto).
  const texto = () =>
    raiz()
      .innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  const campo = (id: string) => raiz().querySelector<HTMLInputElement>(`#${id}`)!;
  const boton = (t: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(t),
    );
  const escribir = (id: string, valor: string) => {
    campo(id).value = valor;
    campo(id).dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const pasoActual = () => raiz().querySelector('[aria-current="step"]')!.textContent!.trim();

  /** Crea la página con el carrito ya cargado y responde lo que pide al abrirse. */
  function abrir(
    opciones: {
      producto?: ProductoCatalogo;
      resumen?: ResumenPedido | null;
      perfil?: typeof PERFIL | null;
    } = {},
  ) {
    const { producto = CHIFLE, resumen = resumenPedido(), perfil = PERFIL } = opciones;
    fixture = TestBed.createComponent(Checkout);
    fixture.detectChanges();

    if (carrito.items().length) httpMock.expectOne(PRODUCTO_URL).flush(producto);
    const reqPerfil = httpMock.expectOne(PERFIL_URL);
    if (perfil) reqPerfil.flush(perfil);
    else reqPerfil.flush({ message: 'x' }, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    if (resumen) httpMock.expectOne(RESUMEN_URL).flush(resumen);
    fixture.detectChanges();
  }

  /** Confirma la dirección que propone el perfil y responde el servidor. */
  function confirmar(resumen = resumenPedido({ tipo_entrega: 'delivery' })) {
    boton('Confirmar dirección')!.click();
    fixture.detectChanges();
    httpMock.expectOne(RESUMEN_URL).flush(resumen);
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    carrito = TestBed.inject(CarritoStore);
  });

  afterEach(() => httpMock.verify());

  describe('with products in the cart', () => {
    beforeEach(() => carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 2));

    it('asks the server for the summary with the cart lines, without a delivery address yet', () => {
      fixture = TestBed.createComponent(Checkout);
      fixture.detectChanges();
      httpMock.expectOne(PRODUCTO_URL).flush(CHIFLE);
      httpMock.expectOne(PERFIL_URL).flush(PERFIL);
      fixture.detectChanges();

      const req = httpMock.expectOne(RESUMEN_URL);
      expect(req.request.body).toEqual({
        items: [{ producto_presentacion_id: 101, cantidad: 2 }],
        tipo_entrega: 'recojo_tienda',
      });
      req.flush(resumenPedido());
    });

    it('shows the client data, the default address and the totals (RF-B20, RF-B22)', () => {
      abrir();

      expect(texto()).toContain('Rosa Elena Quispe Huamán');
      expect(texto()).toContain('987654321');
      expect(campo('co-dir').value).toBe(DIRECCION_PERFIL);
      expect(texto()).toContain('Resumen del pedido');
      expect(texto()).toContain('Subtotal (2 productos)');
      expect(texto()).toContain('Total S/ 10.00');
    });

    it('shows the wholesale price that the server applied (RN17, RF-B23)', () => {
      abrir({
        resumen: resumenPedido({
          items: [
            lineaResumen({
              producto_presentacion_id: 101,
              cantidad: 30,
              precio_aplicado: 4.2,
              es_mayorista: true,
              subtotal: 126,
            }),
          ],
          subtotal: 126,
          total: 126,
        }),
      });

      expect(texto()).toContain('250g · 30 × S/ 4.20');
      expect(texto()).toContain('Mayorista');
      expect(texto()).toContain('Total S/ 126.00');
    });

    it('starts on the delivery step with payment not yet available', () => {
      abrir();

      expect(pasoActual()).toContain('Datos de entrega');
      expect(boton('Continuar al pago')!.disabled).toBe(true);
      expect(texto()).toContain('Confirma tu dirección de entrega para continuar');
    });

    it('lets the client leave without paying: back to the catalog', () => {
      abrir();

      const volver = [...raiz().querySelectorAll<HTMLAnchorElement>('a')].find((a) =>
        a.textContent!.includes('Volver al catálogo'),
      )!;
      expect(volver.getAttribute('href')).toBe('/catalogo');
    });

    it('still works when the profile cannot be loaded', () => {
      abrir({ perfil: null });

      expect(texto()).toContain('Resumen del pedido');
      expect(raiz().querySelectorAll('[aria-label="Cargando"]')).toHaveLength(2);
    });

    describe('confirming the address (RF-B20)', () => {
      it('confirms the default address with a delivery request', () => {
        abrir();

        boton('Confirmar dirección')!.click();
        fixture.detectChanges();

        const req = httpMock.expectOne(RESUMEN_URL);
        expect(req.request.body).toEqual({
          items: [{ producto_presentacion_id: 101, cantidad: 2 }],
          tipo_entrega: 'delivery',
          direccion_entrega: DIRECCION_PERFIL,
        });
        req.flush(resumenPedido({ tipo_entrega: 'delivery', direccion_entrega: DIRECCION_PERFIL }));
      });

      it('locks the address, moves to payment and tells the client', () => {
        abrir();

        confirmar(resumenPedido({ tipo_entrega: 'delivery', direccion_entrega: DIRECCION_PERFIL }));

        expect(campo('co-dir').disabled).toBe(true);
        expect(texto()).toContain('Dirección confirmada');
        expect(pasoActual()).toContain('Pago');
        expect(texto()).toContain('El pago estará disponible próximamente');
        expect(TestBed.inject(Avisos).actual()?.titulo).toBe('Dirección confirmada');
      });

      it('sends the edited address with its reference', () => {
        abrir();
        escribir('co-dir', 'Av. José Larco 1232, Int 402');
        escribir('co-ref', 'Frente al parque');

        boton('Confirmar dirección')!.click();
        fixture.detectChanges();

        const req = httpMock.expectOne(RESUMEN_URL);
        expect(req.request.body.direccion_entrega).toBe(
          'Av. José Larco 1232, Int 402 · Ref: Frente al parque',
        );
        req.flush(resumenPedido({ tipo_entrega: 'delivery' }));
      });

      it('does not call the server when the address is too short', () => {
        abrir();
        escribir('co-dir', 'Av. 1');

        boton('Confirmar dirección')!.click();
        fixture.detectChanges();

        httpMock.expectNone(RESUMEN_URL);
        expect(texto()).toContain('Ingresa la dirección de entrega.');
        expect(pasoActual()).toContain('Datos de entrega');
      });

      it('shows the server error and keeps the address editable', () => {
        abrir();

        boton('Confirmar dirección')!.click();
        fixture.detectChanges();
        httpMock
          .expectOne(RESUMEN_URL)
          .flush(
            { message: 'La presentación 101 no está disponible en el catálogo' },
            { status: 409, statusText: 'Conflict' },
          );
        fixture.detectChanges();

        expect(raiz().querySelector('[role="alert"]')!.textContent).toContain(
          'no está disponible en el catálogo',
        );
        expect(campo('co-dir').disabled).toBe(false);
        expect(pasoActual()).toContain('Datos de entrega');
      });

      it('cannot be confirmed twice while the server is answering', () => {
        abrir();

        boton('Confirmar dirección')!.click();
        fixture.detectChanges();
        expect(texto()).toContain('Confirmando…');
        raiz().querySelector('form')!.dispatchEvent(new Event('submit'));
        fixture.detectChanges();

        httpMock.expectOne(RESUMEN_URL).flush(resumenPedido({ tipo_entrega: 'delivery' }));
      });
    });

    describe('cancelling the confirmation (RF-B21)', () => {
      it('unlocks the address so the client can change it', () => {
        abrir();
        confirmar();

        boton('Deshacer')!.click();
        fixture.detectChanges();

        expect(campo('co-dir').disabled).toBe(false);
        expect(boton('Confirmar dirección')).toBeDefined();
        expect(pasoActual()).toContain('Datos de entrega');
        expect(texto()).not.toContain('El pago estará disponible');
      });

      it('confirms a different address afterwards', () => {
        abrir();
        confirmar();
        boton('Deshacer')!.click();
        fixture.detectChanges();
        escribir('co-dir', 'Jr. Cusco 450, Lima');

        boton('Confirmar dirección')!.click();
        fixture.detectChanges();

        const req = httpMock.expectOne(RESUMEN_URL);
        expect(req.request.body.direccion_entrega).toBe('Jr. Cusco 450, Lima');
        req.flush(
          resumenPedido({ tipo_entrega: 'delivery', direccion_entrega: 'Jr. Cusco 450, Lima' }),
        );
        fixture.detectChanges();
        expect(pasoActual()).toContain('Pago');
      });
    });

    describe('when the cart changes while checking out', () => {
      it('recalculates the summary with the new quantity', () => {
        abrir();

        carrito.cambiarCantidad(101, 5);
        fixture.detectChanges();

        const req = httpMock.expectOne(RESUMEN_URL);
        expect(req.request.body.items).toEqual([{ producto_presentacion_id: 101, cantidad: 5 }]);
        req.flush(
          resumenPedido({
            items: [lineaResumen({ producto_presentacion_id: 101, cantidad: 5, subtotal: 25 })],
            subtotal: 25,
            total: 25,
          }),
        );
        fixture.detectChanges();
        expect(texto()).toContain('Total S/ 25.00');
        expect(campo('co-dir').value).toBe(DIRECCION_PERFIL);
      });

      it('keeps the confirmed address when it recalculates', () => {
        abrir();
        confirmar(resumenPedido({ tipo_entrega: 'delivery', direccion_entrega: DIRECCION_PERFIL }));

        carrito.cambiarCantidad(101, 3);
        fixture.detectChanges();

        const req = httpMock.expectOne(RESUMEN_URL);
        expect(req.request.body.tipo_entrega).toBe('delivery');
        expect(req.request.body.direccion_entrega).toBe(DIRECCION_PERFIL);
        req.flush(resumenPedido({ tipo_entrega: 'delivery', direccion_entrega: DIRECCION_PERFIL }));
        fixture.detectChanges();
        expect(pasoActual()).toContain('Pago');
      });

      it('shows the empty state when the client removes everything', () => {
        abrir();

        carrito.eliminar(101);
        fixture.detectChanges();

        httpMock.expectNone(RESUMEN_URL);
        expect(texto()).toContain('Tu carrito está vacío');
      });
    });

    describe('when the summary cannot be calculated', () => {
      it('shows the error and retries on demand', () => {
        fixture = TestBed.createComponent(Checkout);
        fixture.detectChanges();
        httpMock.expectOne(PRODUCTO_URL).flush(CHIFLE);
        httpMock.expectOne(PERFIL_URL).flush(PERFIL);
        fixture.detectChanges();
        httpMock
          .expectOne(RESUMEN_URL)
          .flush({ message: 'Error interno' }, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(raiz().querySelector('[role="alert"]')!.textContent).toContain('Error interno');
        expect(raiz().querySelector('app-checkout-resumen')).toBeNull();

        boton('Reintentar')!.click();
        fixture.detectChanges();
        httpMock.expectOne(RESUMEN_URL).flush(resumenPedido());
        fixture.detectChanges();

        expect(raiz().querySelector('[role="alert"]')).toBeNull();
        expect(texto()).toContain('Total S/ 10.00');
      });

      it('explains a connection failure', () => {
        fixture = TestBed.createComponent(Checkout);
        fixture.detectChanges();
        httpMock.expectOne(PRODUCTO_URL).flush(CHIFLE);
        httpMock.expectOne(PERFIL_URL).flush(PERFIL);
        fixture.detectChanges();
        httpMock.expectOne(RESUMEN_URL).error(new ProgressEvent('error'));
        fixture.detectChanges();

        expect(texto()).toContain('No se pudo conectar con el servidor');
      });
    });
  });

  describe('with products that are no longer available', () => {
    const sinStock = (ids: number[]): ProductoCatalogo => ({
      ...CHIFLE,
      presentaciones: CHIFLE.presentaciones.map((p) =>
        ids.includes(p.id) ? { ...p, disponible: false } : p,
      ),
    });

    it('leaves them out of the order and warns the client', () => {
      carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 2);
      carrito.agregar(CHIFLE, CHIFLE.presentaciones[1], 1);
      fixture = TestBed.createComponent(Checkout);
      fixture.detectChanges();
      httpMock.expectOne(PRODUCTO_URL).flush(sinStock([102]));
      httpMock.expectOne(PERFIL_URL).flush(PERFIL);
      fixture.detectChanges();

      const req = httpMock.expectOne(RESUMEN_URL);
      expect(req.request.body.items).toEqual([{ producto_presentacion_id: 101, cantidad: 2 }]);
      req.flush(resumenPedido());
      fixture.detectChanges();

      expect(raiz().querySelector('[role="alert"]')!.textContent).toContain(
        'Un producto de tu carrito no está disponible y no se incluye en el pedido',
      );
    });

    it('opens the cart so the client can review it', () => {
      carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 2);
      carrito.agregar(CHIFLE, CHIFLE.presentaciones[1], 1);
      fixture = TestBed.createComponent(Checkout);
      fixture.detectChanges();
      httpMock.expectOne(PRODUCTO_URL).flush(sinStock([102]));
      httpMock.expectOne(PERFIL_URL).flush(PERFIL);
      fixture.detectChanges();
      httpMock.expectOne(RESUMEN_URL).flush(resumenPedido());
      fixture.detectChanges();

      boton('Revisar carrito')!.click();

      expect(carrito.abierto()).toBe(true);
    });

    it('does not ask the server for anything when nothing can be bought', () => {
      carrito.agregar(CHIFLE, CHIFLE.presentaciones[1], 1);
      abrir({ producto: sinStock([102]), resumen: null });

      expect(texto()).toContain('Ningún producto de tu carrito está disponible');
      expect(boton('Revisar carrito')).toBeDefined();
    });
  });

  describe('with an empty cart', () => {
    it('invites the client to the catalog and asks the server for nothing', () => {
      abrir({ resumen: null });

      expect(texto()).toContain('Tu carrito está vacío');
      expect(boton('Revisar carrito')).toBeUndefined();
      const ver = [...raiz().querySelectorAll<HTMLAnchorElement>('a')].find((a) =>
        a.textContent!.includes('Ver catálogo'),
      )!;
      expect(ver.getAttribute('href')).toBe('/catalogo');
    });
  });

  it('shows placeholders while the summary loads', () => {
    carrito.agregar(CHIFLE, CHIFLE.presentaciones[0], 2);
    fixture = TestBed.createComponent(Checkout);
    fixture.detectChanges();

    expect(raiz().querySelector('[aria-label="Cargando tu pedido"]')).not.toBeNull();

    httpMock.expectOne(PRODUCTO_URL).flush(CHIFLE);
    httpMock.expectOne(PERFIL_URL).flush(PERFIL);
    fixture.detectChanges();
    httpMock.expectOne(RESUMEN_URL).flush(resumenPedido());
  });

  it('has a page heading for assistive technology', () => {
    abrir({ resumen: null });

    expect(raiz().querySelector('h1')!.textContent).toContain('Finalizar compra');
  });
});
