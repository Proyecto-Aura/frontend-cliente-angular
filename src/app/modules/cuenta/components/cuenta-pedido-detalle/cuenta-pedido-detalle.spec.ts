import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidoPortalVista } from '../../models/pedido-portal.model';
import {
  PEDIDO_DETALLE_PRUEBA as detalle,
  PEDIDO_RESUMEN_PRUEBA as resumen,
} from '../../testing/pedidos-data';
import { CuentaPedidoDetalle } from './cuenta-pedido-detalle';

describe('CuentaPedidoDetalle', () => {
  let fixture: ComponentFixture<CuentaPedidoDetalle>;
  let origen: HTMLButtonElement;

  // JSDOM no implementa los diálogos nativos. El aislamiento real se prueba en Chromium.
  beforeAll(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CuentaPedidoDetalle] }).compileComponents();
    origen = document.createElement('button');
    origen.textContent = 'Ver detalle';
    document.body.append(origen);
    origen.focus();
  });

  afterEach(() => {
    fixture?.destroy();
    origen.remove();
  });

  const crear = async (pedido: PedidoPortalVista = { resumen, detalle, errorDetalle: null }) => {
    fixture = TestBed.createComponent(CuentaPedidoDetalle);
    fixture.componentRef.setInput('pedido', pedido);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  };

  it('opens a named modal with initial focus on close and restores focus when closed', async () => {
    const dialogo = await crear();
    const cerrar = vi.fn();
    fixture.componentInstance.cerrar.subscribe(cerrar);
    const boton = dialogo.querySelector<HTMLButtonElement>(
      '[aria-label="Cerrar detalle del pedido"]',
    )!;
    expect(dialogo.open).toBe(true);
    expect(document.activeElement).toBe(boton);
    expect(
      document.getElementById(dialogo.getAttribute('aria-labelledby')!)?.textContent,
    ).toContain(resumen.codigo);

    boton.click();
    expect(dialogo.open).toBe(false);
    expect(cerrar).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(origen);
  });

  it('shows each item with its unit price when there is no discount applied', async () => {
    const dialogo = await crear();
    expect(dialogo.textContent).toContain('Producto de prueba');
    expect(dialogo.textContent).toContain('250 gr');
    expect(dialogo.textContent).toContain('2 unidades');
    expect(dialogo.textContent).toContain('S/ 6.00 c/u');
    expect(dialogo.querySelector('del, .line-through')).toBeNull();
    expect(dialogo.textContent).toContain('Total');
    expect(dialogo.textContent).toContain('S/ 12.00');
  });

  it('shows the product photo, falling back to the cart icon when there is none', async () => {
    const dialogo = await crear({
      resumen,
      detalle: {
        ...detalle,
        items: [{ ...detalle.items[0], imagen_url: 'https://cdn.test/producto.jpg' }],
      },
      errorDetalle: null,
    });
    const img = dialogo.querySelector<HTMLImageElement>('img')!;
    expect(img.src).toBe('https://cdn.test/producto.jpg');
    expect(img.alt).toBe(detalle.items[0].producto);

    const sinFoto = await crear();
    expect(sinFoto.querySelector('img')).toBeNull();
    expect(sinFoto.querySelector('app-icon svg')).not.toBeNull();
  });

  it('shows the crossed-out unit price when a discount was applied', async () => {
    const dialogo = await crear({
      resumen,
      detalle: {
        ...detalle,
        items: [{ ...detalle.items[0], precio_unitario: 8, precio_aplicado: 6, subtotal: 12 }],
      },
      errorDetalle: null,
    });
    const precios = dialogo.querySelector('.line-through')!;
    expect(precios.textContent).toContain('S/ 8.00');
    expect(dialogo.textContent).toContain('S/ 6.00');
  });

  it('shows the issued boleta and its code', async () => {
    const dialogo = await crear({
      resumen,
      detalle: {
        ...detalle,
        pago: {
          ...detalle.pago!,
          comprobante: {
            tipo: 'boleta',
            codigo: 'B001-00000015',
            serie: 'B001',
            numero: 15,
            ruc: null,
            razon_social: null,
            subtotal: 12,
            total: 12,
            fecha_emision: '2026-11-05T12:05:00Z',
          },
        },
      },
      errorDetalle: null,
    });
    expect(dialogo.textContent).toContain('Boleta B001-00000015');
    expect(dialogo.textContent).not.toContain('RUC');
  });

  it('shows the RUC and razón social for an issued factura', async () => {
    const dialogo = await crear({
      resumen,
      detalle: {
        ...detalle,
        pago: {
          ...detalle.pago!,
          comprobante: {
            tipo: 'factura',
            codigo: 'F001-00000003',
            serie: 'F001',
            numero: 3,
            ruc: '20123456789',
            razon_social: 'Empresa de Pruebas SAC',
            subtotal: 12,
            total: 12,
            fecha_emision: '2026-11-05T12:05:00Z',
          },
        },
      },
      errorDetalle: null,
    });
    expect(dialogo.textContent).toContain('Factura F001-00000003');
    expect(dialogo.textContent).toContain('RUC 20123456789 · Empresa de Pruebas SAC');
  });

  it('says the comprobante is pending instead of assuming the payment is broken', async () => {
    const dialogo = await crear();
    expect(dialogo.textContent).toContain('Pendiente de emisión');
  });

  it('says a payment was not registered instead of showing an empty table', async () => {
    const dialogo = await crear({ resumen, detalle: { ...detalle, pago: null }, errorDetalle: null });
    expect(dialogo.textContent).toContain('Todavía no se registró un pago para este pedido.');
    expect(dialogo.querySelector('dl')).toBeNull();
  });

  it('highlights every stage up to and including the current one, without a tracker for cancelled orders', async () => {
    const enCamino = await crear({
      resumen,
      detalle: { ...detalle, estado: 'en_camino' },
      errorDetalle: null,
    });
    expect(
      [...enCamino.querySelectorAll('ol li')].map((li) => li.textContent?.trim()),
    ).toEqual(['Confirmado', 'En preparación', 'En camino', 'Entregado']);
    const activos = [...enCamino.querySelectorAll('ol li')].filter((li) =>
      li.querySelector('span.font-semibold.text-primary'),
    );
    expect(activos).toHaveLength(3); // confirmado, en_preparacion, en_camino

    const cancelado = await crear({
      resumen,
      detalle: { ...detalle, estado: 'cancelado' },
      errorDetalle: null,
    });
    expect(cancelado.querySelector('ol')).toBeNull();
    expect(cancelado.textContent).toContain('Cancelado');
  });

  it.each([
    ['en_espera_inventario', 'Confirmado', 1],
    ['pendiente_entrega', 'En preparación', 2],
  ] as const)(
    'collapses the internal %s stage into "%s" for the client, without a step of its own',
    async (estado, etiquetaEsperada, pasoActivoEsperado) => {
      const dialogo = await crear({
        resumen,
        detalle: { ...detalle, estado },
        errorDetalle: null,
      });
      expect(dialogo.querySelectorAll('ol li')).toHaveLength(4);
      expect(dialogo.textContent).toContain(etiquetaEsperada);
      const activos = [...dialogo.querySelectorAll('ol li')].filter((li) =>
        li.querySelector('span.font-semibold.text-primary'),
      );
      expect(activos).toHaveLength(pasoActivoEsperado);
    },
  );

  it('shows a fallback message instead of inventing items when the detail could not be verified', async () => {
    const dialogo = await crear({
      resumen,
      detalle: null,
      errorDetalle: 'No pudimos verificar este pedido.',
    });
    expect(dialogo.textContent).toContain('No pudimos cargar el detalle de productos.');
    expect(dialogo.textContent).not.toContain('Producto de prueba');
  });
});
