import { Component, input } from '@angular/core';

import { UiBadge } from '../../../../shared/ui';
import { EstadoSolicitud } from '../../models/solicitud-reembolso.model';

/** Estado de una solicitud de reembolso: pendiente / aprobado / rechazado. */
@Component({
  selector: 'app-cuenta-reembolso-badge',
  imports: [UiBadge],
  host: { class: 'inline-flex' },
  templateUrl: './cuenta-reembolso-badge.html',
})
export class CuentaReembolsoBadge {
  readonly status = input.required<EstadoSolicitud>();
}
