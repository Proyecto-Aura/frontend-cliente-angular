import { TestBed } from '@angular/core/testing';
import { CuentaPedidoCard } from './cuenta-pedido-card';
import { EstadoPedido } from '../../models/pedido-portal.model';
import {
  PEDIDO_DETALLE_PRUEBA as detalle,
  PEDIDO_RESUMEN_PRUEBA as resumen,
} from '../../testing/pedidos-data';

describe('CuentaPedidoCard', () => {
  it.each<{ estado: EstadoPedido; permitido: boolean }>([
    { estado: 'confirmado', permitido: true },
    { estado: 'entregado', permitido: true },
    { estado: 'cancelado', permitido: true },
    { estado: 'en_camino', permitido: false },
    { estado: 'en_preparacion', permitido: false },
    { estado: 'pendiente_entrega', permitido: false },
    { estado: 'en_espera_inventario', permitido: false },
  ])('RF-B38: el botón para $estado aparece: $permitido', async ({ estado, permitido }) => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    // Un resumen antiguo confirmado no debe habilitar un detalle que ya cambió de estado.
    fixture.componentRef.setInput('pedido', {
      resumen,
      detalle: { ...detalle, estado },
      errorDetalle: null,
    });
    await fixture.whenStable();
    const solicitar = vi.fn();
    fixture.componentInstance.solicitar.subscribe(solicitar);
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-label^="Solicitar reembolso"]',
    );
    expect(boton !== null).toBe(permitido);
    boton?.click();
    if (permitido) expect(solicitar).toHaveBeenCalledExactlyOnceWith(resumen.id);
    else expect(solicitar).not.toHaveBeenCalled();
  });

  it('offers the verified paid order and emits its id without creating a request', async () => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    fixture.componentRef.setInput('pedido', { resumen, detalle, errorDetalle: null });
    await fixture.whenStable();
    const solicitar = vi.fn();
    fixture.componentInstance.solicitar.subscribe(solicitar);
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.textContent).toContain('Pagado');
    expect(raiz.textContent).toContain('Producto de prueba');
    raiz.querySelector<HTMLButtonElement>('[aria-label^="Solicitar reembolso"]')!.click();
    expect(solicitar).toHaveBeenCalledExactlyOnceWith(21);

    fixture.componentRef.setInput('pedido', {
      resumen: { ...resumen, reembolso: { id: 4, estado: 'rechazado' } },
      detalle,
      errorDetalle: null,
    });
    await fixture.whenStable();
    expect(raiz.textContent).toContain('Solicitud de reembolso registrada');
    expect(raiz.textContent).toContain('Rechazado');
    expect(raiz.querySelector('button')).toBeNull();
  });

  it.each<EstadoPedido>(['confirmado', 'entregado', 'cancelado'])(
    'RF-B39: no permite solicitar sobre un pedido %s sin pago',
    async (estado) => {
      const fixture = TestBed.createComponent(CuentaPedidoCard);
      fixture.componentRef.setInput('pedido', {
        resumen: { ...resumen, estado },
        detalle: { ...detalle, estado, pago: null },
        errorDetalle: null,
      });
      await fixture.whenStable();
      const raiz = fixture.nativeElement as HTMLElement;
      expect(raiz.textContent).toContain('Sin pago registrado');
      expect(raiz.querySelector('[aria-label^="Solicitar reembolso"]')).toBeNull();
      expect(raiz.querySelector('app-cuenta-solicitud-estado')).toBeNull();
    },
  );

  it.each<[EstadoPedido, string, string]>([
    ['confirmado', 'Confirmado', 'bg-neutral-50'],
    ['en_espera_inventario', 'Confirmado', 'bg-neutral-50'],
    ['en_preparacion', 'En preparación', 'bg-warning-50'],
    ['pendiente_entrega', 'En preparación', 'bg-warning-50'],
    ['en_camino', 'En camino', 'bg-info-50'],
    ['entregado', 'Entregado', 'bg-success-50'],
    ['cancelado', 'Cancelado', 'bg-danger-50'],
  ])(
    'shows the internal state %s to the client as "%s" with its own color (ERP has 7 states, the client sees 5)',
    async (estado, etiquetaEsperada, claseColorEsperada) => {
      const fixture = TestBed.createComponent(CuentaPedidoCard);
      fixture.componentRef.setInput('pedido', {
        resumen,
        detalle: { ...detalle, estado },
        errorDetalle: null,
      });
      await fixture.whenStable();
      const raiz = fixture.nativeElement as HTMLElement;
      const badge = raiz.querySelector('[data-testid="estado-pedido"]')!;
      expect(badge.textContent).toContain(etiquetaEsperada);
      expect(badge.className).toContain(claseColorEsperada);
    },
  );

  it.each<EstadoPedido>(['en_espera_inventario', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'])(
    'does not offer to cancel once the order left confirmado (%s), even though the client groups some of these as "Confirmado"',
    async (estado) => {
      const fixture = TestBed.createComponent(CuentaPedidoCard);
      fixture.componentRef.setInput('pedido', {
        resumen,
        detalle: { ...detalle, estado },
        errorDetalle: null,
      });
      await fixture.whenStable();
      const raiz = fixture.nativeElement as HTMLElement;
      expect(raiz.querySelector('[aria-label^="Cancelar el pedido"]')).toBeNull();
    },
  );

  it('asks for confirmation before emitting cancelar, and backing out emits nothing', async () => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    fixture.componentRef.setInput('pedido', { resumen, detalle, errorDetalle: null });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const cancelar = vi.fn();
    fixture.componentInstance.cancelar.subscribe(cancelar);

    raiz.querySelector<HTMLButtonElement>('[aria-label^="Cancelar el pedido"]')!.click();
    await fixture.whenStable();
    expect(raiz.textContent).toContain('¿Seguro?');
    expect(cancelar).not.toHaveBeenCalled();

    [...raiz.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'No')!.click();
    await fixture.whenStable();
    expect(raiz.textContent).not.toContain('¿Seguro?');
    expect(cancelar).not.toHaveBeenCalled();

    raiz.querySelector<HTMLButtonElement>('[aria-label^="Cancelar el pedido"]')!.click();
    await fixture.whenStable();
    [...raiz.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Sí, cancelar')!.click();
    expect(cancelar).toHaveBeenCalledExactlyOnceWith(resumen.id);
  });

  it('disables the confirmation buttons while cancelando is true', async () => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    fixture.componentRef.setInput('pedido', { resumen, detalle, errorDetalle: null });
    fixture.componentRef.setInput('cancelando', true);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector<HTMLButtonElement>('[aria-label^="Cancelar el pedido"]')!.disabled).toBe(
      true,
    );
  });

  it('emits verDetalle with the order id when detail is available, and hides the button otherwise', async () => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    fixture.componentRef.setInput('pedido', { resumen, detalle, errorDetalle: null });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const verDetalle = vi.fn();
    fixture.componentInstance.verDetalle.subscribe(verDetalle);
    raiz.querySelector<HTMLButtonElement>('[aria-label^="Ver detalle"]')!.click();
    expect(verDetalle).toHaveBeenCalledExactlyOnceWith(resumen.id);

    fixture.componentRef.setInput('pedido', {
      resumen,
      detalle: null,
      errorDetalle: 'No pudimos verificar este pedido.',
    });
    await fixture.whenStable();
    expect(raiz.querySelector('[aria-label^="Ver detalle"]')).toBeNull();
  });

  it('does not show a refund action for an unverified order and allows retry', async () => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    fixture.componentRef.setInput('pedido', {
      resumen,
      detalle: null,
      errorDetalle: 'No pudimos verificar este pedido.',
    });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const reintentar = vi.fn();
    fixture.componentInstance.reintentar.subscribe(reintentar);
    expect(raiz.querySelector('[role=alert]')).not.toBeNull();
    raiz.querySelector('button')!.click();
    expect(reintentar).toHaveBeenCalledOnce();
    expect(raiz.textContent).not.toContain('Pagado');
  });
});
