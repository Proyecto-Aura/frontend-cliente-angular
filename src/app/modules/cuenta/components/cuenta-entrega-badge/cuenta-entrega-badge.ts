import { Component, input } from '@angular/core';

import { EstadoEntrega } from '../../models/pedido.model';

/** Estado de entrega del pedido: procesando / en camino / entregado. */
@Component({
  selector: 'app-cuenta-entrega-badge',
  host: { class: 'inline-flex' },
  templateUrl: './cuenta-entrega-badge.html',
})
export class CuentaEntregaBadge {
  readonly status = input.required<EstadoEntrega>();
}
