import { Component, computed, input, output } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { SolicitudVista } from '../../models/solicitud-vista.model';
import { CuentaSolicitudEstado } from '../cuenta-solicitud-estado/cuenta-solicitud-estado';
import { SOLICITUD_ESTADOS } from '../cuenta-solicitud-estado/solicitud-estados';

const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const dia = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

@Component({
  imports: [Icon, CuentaSolicitudEstado],
  selector: 'app-cuenta-solicitud-card',
  templateUrl: './cuenta-solicitud-card.html',
  host: { class: 'block' },
})
export class CuentaSolicitudCard {
  readonly solicitud = input.required<SolicitudVista>();
  readonly detalleDisponible = input(false);
  readonly verDetalle = output<number>();
  protected readonly visual = computed(() => SOLICITUD_ESTADOS[this.solicitud().estado]);
  protected readonly monto = computed(() => moneda.format(this.solicitud().monto));
  protected readonly fecha = computed(() => dia.format(new Date(this.solicitud().fecha_solicitud)));
}
