import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';

import { CuentaApi } from '../../services/cuenta-api';
import { SolicitudReembolso } from '../../models/solicitud-reembolso.model';

type SolicitudData = Pick<
  SolicitudReembolso,
  'orderId' | 'orderSummary' | 'orderTotal' | 'motivo' | 'descripcion'
>;

/** Modal para crear una solicitud de reembolso sobre un pedido pagado. */
@Component({
  selector: 'app-cuenta-solicitud-modal',
  host: { class: 'block' },
  templateUrl: './cuenta-solicitud-modal.html',
})
export class CuentaSolicitudModal {
  readonly preselectedOrderId = input<string | undefined>(undefined);
  readonly close = output<void>();
  readonly submit = output<SolicitudData>();

  private readonly api = inject(CuentaApi);

  protected readonly pedidosPagados = this.api.pedidos().filter((o) => o.payment === 'paid');
  protected readonly motivos = this.api.motivosReembolso;

  protected readonly selectedOrderId = linkedSignal(() => this.preselectedOrderId() ?? '');
  protected readonly orderOpen = signal(false);
  protected readonly motivoOpen = signal(false);
  protected readonly motivo = signal('');
  protected readonly descripcion = signal('');

  protected readonly selectedOrder = computed(() =>
    this.pedidosPagados.find((o) => o.id === this.selectedOrderId()),
  );
  protected readonly canSubmit = computed(
    () =>
      this.selectedOrderId() !== '' &&
      this.motivo() !== '' &&
      this.descripcion().trim().length >= 10,
  );

  protected pickOrder(id: string): void {
    this.selectedOrderId.set(id);
    this.orderOpen.set(false);
  }

  protected pickMotivo(m: string): void {
    this.motivo.set(m);
    this.motivoOpen.set(false);
  }

  protected enviar(): void {
    const order = this.selectedOrder();
    if (!this.canSubmit() || !order) return;
    this.submit.emit({
      orderId: order.id,
      orderSummary: order.summary,
      orderTotal: order.total,
      motivo: this.motivo(),
      descripcion: this.descripcion(),
    });
    this.close.emit();
  }
}
