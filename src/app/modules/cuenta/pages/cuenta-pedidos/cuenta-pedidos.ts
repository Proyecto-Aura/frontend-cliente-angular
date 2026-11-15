import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { CuentaPedidoCard } from '../../components/cuenta-pedido-card/cuenta-pedido-card';
import { CuentaPedidoDetalle } from '../../components/cuenta-pedido-detalle/cuenta-pedido-detalle';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { PedidoPortalVista } from '../../models/pedido-portal.model';

@Component({
  imports: [RouterLink, CuentaPedidoCard, CuentaPedidoDetalle, CuentaNuevaSolicitud],
  providers: [PedidosStore],
  host: { class: 'block' },
  selector: 'app-cuenta-pedidos',
  templateUrl: './cuenta-pedidos.html',
})
export class CuentaPedidos {
  protected readonly pedidos = inject(PedidosStore);
  protected readonly seleccionado = signal<number | null>(null);
  protected readonly pedidoDetalle = signal<PedidoPortalVista | null>(null);
  private readonly router = inject(Router);

  protected verDetalle(id: number): void {
    this.pedidoDetalle.set(this.pedidos.filas().find((p) => p.resumen.id === id) ?? null);
  }

  constructor() {
    this.pedidos.cargar();
  }

  protected registrada(): void {
    this.seleccionado.set(null);
    this.pedidos.cargar();
    void this.router.navigate(['/mi-cuenta/solicitudes']);
  }
}
