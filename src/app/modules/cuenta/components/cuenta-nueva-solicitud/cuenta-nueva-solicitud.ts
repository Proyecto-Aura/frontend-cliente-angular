import { Component, inject, input, output, afterNextRender } from '@angular/core';
import { PedidosStore } from '../../services/pedidos-store';
import { CuentaSolicitudFormulario } from '../cuenta-solicitud-formulario/cuenta-solicitud-formulario';

@Component({
  imports: [CuentaSolicitudFormulario],
  providers: [PedidosStore],
  selector: 'app-cuenta-nueva-solicitud',
  templateUrl: './cuenta-nueva-solicitud.html',
})
export class CuentaNuevaSolicitud {
  readonly pedidoInicialId = input<number | null>(null);
  readonly paginaInicial = input(1);
  readonly cerrar = output<void>();
  protected readonly pedidos = inject(PedidosStore);

  constructor() {
    afterNextRender(() => this.pedidos.cargar(this.paginaInicial()));
  }
}
