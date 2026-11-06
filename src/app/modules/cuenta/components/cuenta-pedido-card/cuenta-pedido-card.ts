import { Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ESTADOS_PEDIDO, PedidoPortalVista } from '../../models/pedido-portal.model';
import { esPedidoElegible, pedidoParaReembolso } from '../../models/solicitud-formulario.model';
import { CuentaSolicitudEstado } from '../cuenta-solicitud-estado/cuenta-solicitud-estado';

@Component({
  imports: [CurrencyPipe, DatePipe, Icon, CuentaSolicitudEstado],
  selector: 'app-cuenta-pedido-card',
  templateUrl: './cuenta-pedido-card.html',
})
export class CuentaPedidoCard {
  readonly pedido = input.required<PedidoPortalVista>();
  readonly solicitar = output<number>();
  readonly reintentar = output<void>();
  protected readonly opcion = computed(() => pedidoParaReembolso(this.pedido()));
  protected readonly elegible = computed(() => {
    const opcion = this.opcion();
    return opcion !== null && esPedidoElegible(opcion);
  });
  protected readonly estado = computed(
    () => this.pedido().detalle?.estado ?? this.pedido().resumen.estado,
  );
  protected readonly etiqueta = computed(() => ESTADOS_PEDIDO[this.estado()]);
  protected readonly tono = computed(() =>
    this.estado() === 'entregado'
      ? 'border-success/50'
      : this.estado() === 'cancelado'
        ? 'border-destructive/50'
        : 'border-border',
  );
  protected readonly articulos = computed(
    () => this.pedido().detalle?.items.reduce((total, item) => total + item.cantidad, 0) ?? 0,
  );
}
