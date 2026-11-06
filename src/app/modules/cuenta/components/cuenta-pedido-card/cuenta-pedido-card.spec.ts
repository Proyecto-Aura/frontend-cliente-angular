import { TestBed } from '@angular/core/testing';
import { CuentaPedidoCard } from './cuenta-pedido-card';
import {
  PEDIDO_DETALLE_PRUEBA as detalle,
  PEDIDO_RESUMEN_PRUEBA as resumen,
} from '../../testing/pedidos-data';

describe('CuentaPedidoCard', () => {
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
