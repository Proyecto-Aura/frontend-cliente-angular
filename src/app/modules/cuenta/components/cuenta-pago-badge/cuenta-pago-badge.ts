import { Component, input } from '@angular/core';

import { UiBadge } from '../../../../shared/ui';
import { EstadoPago } from '../../models/pedido.model';

/** Estado de pago del pedido: pendiente / pagado. */
@Component({
  selector: 'app-cuenta-pago-badge',
  imports: [UiBadge],
  host: { class: 'inline-flex' },
  templateUrl: './cuenta-pago-badge.html',
})
export class CuentaPagoBadge {
  readonly status = input.required<EstadoPago>();
}
