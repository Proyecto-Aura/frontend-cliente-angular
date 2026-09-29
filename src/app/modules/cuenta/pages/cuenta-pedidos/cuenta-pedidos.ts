import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CuentaApi } from '../../services/cuenta-api';
import { CuentaPagoBadge } from '../../components/cuenta-pago-badge/cuenta-pago-badge';
import { CuentaEntregaBadge } from '../../components/cuenta-entrega-badge/cuenta-entrega-badge';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../../shared/ui/toast/toast-service';
import { UiBadge } from '../../../../shared/ui';
import { EstadoEntrega, EstadoPago } from '../../models/pedido.model';

/** Historial de pedidos del cliente, con cancelación. Hija de cuenta-layout. */
@Component({
  selector: 'app-cuenta-pedidos',
  imports: [RouterLink, CuentaPagoBadge, CuentaEntregaBadge, ConfirmDialog, UiBadge],
  host: { class: 'block' },
  templateUrl: './cuenta-pedidos.html',
})
export class CuentaPedidos {
  protected readonly api = inject(CuentaApi);
  private readonly toast = inject(ToastService);

  /** Pedidos cancelados en esta sesión (solo estado local). */
  protected readonly cancelados = signal<ReadonlySet<string>>(new Set());
  /** Id del pedido pendiente de confirmación de cancelación. */
  protected readonly confirmarId = signal<string | null>(null);

  protected estaCancelado(id: string): boolean {
    return this.cancelados().has(id);
  }

  /** Un pedido se puede cancelar si está en curso (procesando o en camino). */
  protected sePuedeCancelar(payment: EstadoPago, delivery: EstadoEntrega): boolean {
    return (
      (payment === 'pending' && delivery === 'processing') ||
      (payment === 'paid' && delivery === 'shipping')
    );
  }

  protected borde(id: string, payment: string, delivery: string): string {
    if (this.estaCancelado(id)) return 'border-line-soft';
    if (payment === 'pending') return 'border-[#fde68a]';
    if (delivery === 'delivered') return 'border-[#bbf7d0]';
    return 'border-[#fca5a5]';
  }

  // TODO: PATCH /pedidos/:id/cancelar cuando exista el endpoint.
  protected confirmarCancelacion(): void {
    const id = this.confirmarId();
    if (!id) return;
    this.cancelados.update((set) => new Set(set).add(id));
    this.toast.success('Pedido cancelado', `El pedido #${id} fue cancelado correctamente.`);
    this.confirmarId.set(null);
  }
}
