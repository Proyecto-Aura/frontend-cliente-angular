import { Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../../../shared/ui/icon/icon';
import {
  COLOR_ESTADO_CLIENTE,
  ESTADOS_PEDIDO_CLIENTE,
  ICONO_ESTADO_CLIENTE,
  PedidoPortalVista,
  estadoParaCliente,
} from '../../models/pedido-portal.model';
import { esPedidoElegible, pedidoParaReembolso } from '../../models/solicitud-formulario.model';
import { CuentaSolicitudEstado } from '../cuenta-solicitud-estado/cuenta-solicitud-estado';

@Component({
  imports: [CurrencyPipe, DatePipe, Icon, CuentaSolicitudEstado],
  selector: 'app-cuenta-pedido-card',
  templateUrl: './cuenta-pedido-card.html',
})
export class CuentaPedidoCard {
  readonly pedido = input.required<PedidoPortalVista>();
  /** true mientras este pedido puntual tiene una cancelación en curso. */
  readonly cancelando = input(false);
  readonly solicitar = output<number>();
  readonly reintentar = output<void>();
  readonly verDetalle = output<number>();
  readonly cancelar = output<number>();
  protected readonly confirmandoCancelar = signal(false);
  protected readonly opcion = computed(() => pedidoParaReembolso(this.pedido()));
  protected readonly elegible = computed(() => {
    const opcion = this.opcion();
    return opcion !== null && esPedidoElegible(opcion);
  });
  protected readonly estado = computed(
    () => this.pedido().detalle?.estado ?? this.pedido().resumen.estado,
  );
  protected readonly estadoCliente = computed(() => estadoParaCliente(this.estado()));
  protected readonly etiqueta = computed(() => ESTADOS_PEDIDO_CLIENTE[this.estadoCliente()]);
  protected readonly iconoEstado = computed(() => ICONO_ESTADO_CLIENTE[this.estadoCliente()]);
  protected readonly colorEstado = computed(() => COLOR_ESTADO_CLIENTE[this.estadoCliente()]);
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
  /** Las primeras 2 fotos para la pila de miniaturas; vacío si no hay detalle. */
  protected readonly miniaturas = computed(() => this.pedido().detalle?.items.slice(0, 2) ?? []);
  // El backend cancela desde "confirmado" y "en_espera_inventario" (el mismo paso
  // visual que el cliente ve fusionado como "Confirmado"); se bloquea recién al
  // entrar a "en_preparacion" en adelante.
  protected readonly puedeCancelar = computed(() => this.estadoCliente() === 'confirmado');

  protected pedirConfirmacion(): void {
    this.confirmandoCancelar.set(true);
  }

  protected descartarConfirmacion(): void {
    this.confirmandoCancelar.set(false);
  }

  protected confirmarCancelacion(): void {
    this.confirmandoCancelar.set(false);
    this.cancelar.emit(this.pedido().resumen.id);
  }
}
