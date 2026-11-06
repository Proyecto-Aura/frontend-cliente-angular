import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { CuentaPedidoCard } from '../../components/cuenta-pedido-card/cuenta-pedido-card';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { CuentaSolicitudConfirmacion } from '../../components/cuenta-solicitud-confirmacion/cuenta-solicitud-confirmacion';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';

@Component({
  imports: [RouterLink, CuentaPedidoCard, CuentaNuevaSolicitud, CuentaSolicitudConfirmacion],
  providers: [PedidosStore],
  host: { class: 'block' },
  selector: 'app-cuenta-pedidos',
  templateUrl: './cuenta-pedidos.html',
})
export class CuentaPedidos {
  protected readonly pedidos = inject(PedidosStore);
  protected readonly seleccionado = signal<number | null>(null);
  protected readonly confirmacion = signal<SolicitudDetalle | null>(null);

  constructor() {
    this.pedidos.cargar();
  }

  protected registrada(solicitud: SolicitudDetalle): void {
    this.confirmacion.set(solicitud);
    this.seleccionado.set(null);
    this.pedidos.cargar();
  }
}
