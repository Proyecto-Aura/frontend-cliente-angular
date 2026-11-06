import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { CuentaPedidoCard } from '../../components/cuenta-pedido-card/cuenta-pedido-card';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';

@Component({
  imports: [RouterLink, CuentaPedidoCard, CuentaNuevaSolicitud],
  providers: [PedidosStore],
  host: { class: 'block' },
  selector: 'app-cuenta-pedidos',
  templateUrl: './cuenta-pedidos.html',
})
export class CuentaPedidos {
  protected readonly pedidos = inject(PedidosStore);
  protected readonly seleccionado = signal<number | null>(null);

  constructor() {
    this.pedidos.cargar();
  }
}
