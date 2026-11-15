import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

import { CuentaDialogo } from '../cuenta-dialogo/cuenta-dialogo';
import { Icon } from '../../../../shared/ui/icon/icon';
import { etiquetaComprobante } from '../../../checkout/utils/checkout.utils';
import {
  COLOR_ESTADO_CLIENTE,
  ESTADOS_PEDIDO_CLIENTE,
  EstadoPedidoCliente,
  ICONO_ESTADO_CLIENTE,
  PedidoPortalVista,
  estadoParaCliente,
} from '../../models/pedido-portal.model';

const ORDEN_ESTADOS: EstadoPedidoCliente[] = [
  'confirmado',
  'en_preparacion',
  'en_camino',
  'entregado',
];

@Component({
  imports: [CurrencyPipe, DatePipe, Icon, CuentaDialogo],
  selector: 'app-cuenta-pedido-detalle',
  templateUrl: './cuenta-pedido-detalle.html',
})
export class CuentaPedidoDetalle {
  readonly pedido = input.required<PedidoPortalVista>();
  readonly cerrar = output<void>();
  private readonly botonCerrar = viewChild<ElementRef<HTMLButtonElement>>('botonCerrar');
  protected readonly etiquetaComprobante = etiquetaComprobante;

  private readonly estado = computed(
    () => this.pedido().detalle?.estado ?? this.pedido().resumen.estado,
  );
  // El cliente solo ve 5 estados: los internos del ERP de más se fusionan con el anterior visible.
  protected readonly estadoCliente = computed(() => estadoParaCliente(this.estado()));
  protected readonly etiquetaEstado = computed(() => ESTADOS_PEDIDO_CLIENTE[this.estadoCliente()]);
  protected readonly iconoEstado = computed(() => ICONO_ESTADO_CLIENTE[this.estadoCliente()]);
  protected readonly colorEstado = computed(() => COLOR_ESTADO_CLIENTE[this.estadoCliente()]);
  protected readonly cancelado = computed(() => this.estadoCliente() === 'cancelado');
  // Paso actual dentro del flujo normal (cancelado no tiene posición en esta línea).
  protected readonly pasoActual = computed(() =>
    this.cancelado() ? -1 : ORDEN_ESTADOS.indexOf(this.estadoCliente()),
  );
  protected readonly pasos = ORDEN_ESTADOS.map((estado) => ({
    estado,
    etiqueta: ESTADOS_PEDIDO_CLIENTE[estado],
  }));

  constructor() {
    afterNextRender(() => this.botonCerrar()?.nativeElement.focus({ preventScroll: true }));
  }
}
