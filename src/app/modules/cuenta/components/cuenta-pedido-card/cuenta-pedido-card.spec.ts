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
    raiz.querySelector('button')!.click();
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

  it('does not show a refund action for an unpaid or unverified order and allows retry', async () => {
    const fixture = TestBed.createComponent(CuentaPedidoCard);
    fixture.componentRef.setInput('pedido', {
      resumen,
      detalle: { ...detalle, pago: null },
      errorDetalle: null,
    });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.textContent).toContain('Sin pago registrado');
    expect(raiz.querySelector('button')).toBeNull();
    fixture.componentRef.setInput('pedido', {
      resumen,
      detalle: null,
      errorDetalle: 'No pudimos verificar este pedido.',
    });
    await fixture.whenStable();
    const reintentar = vi.fn();
    fixture.componentInstance.reintentar.subscribe(reintentar);
    expect(raiz.querySelector('[role=alert]')).not.toBeNull();
    raiz.querySelector('button')!.click();
    expect(reintentar).toHaveBeenCalledOnce();
    expect(raiz.textContent).not.toContain('Pagado');
  });
});
