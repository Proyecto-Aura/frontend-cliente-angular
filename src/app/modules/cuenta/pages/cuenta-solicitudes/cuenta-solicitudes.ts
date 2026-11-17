import { Component, input, output } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { CuentaSolicitudCard } from '../../components/cuenta-solicitud-card/cuenta-solicitud-card';
import { CuentaSolicitudEstado } from '../../components/cuenta-solicitud-estado/cuenta-solicitud-estado';
import { ESTADOS_SOLICITUD, SolicitudVista } from '../../models/solicitud-vista.model';

@Component({
  selector: 'app-cuenta-solicitudes',
  imports: [Icon, CuentaSolicitudCard, CuentaSolicitudEstado],
  host: { class: 'block' },
  templateUrl: './cuenta-solicitudes.html',
})
export class CuentaSolicitudes {
  /** null significa que no se ha consultado el listado; no equivale a una lista vacía. */
  readonly solicitudes = input<readonly SolicitudVista[] | null>(null);
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
  readonly accionesDisponibles = input(false);
  readonly nuevaSolicitud = output<void>();
  readonly verDetalle = output<number>();
  readonly reintentar = output<void>();
  protected readonly estados = ESTADOS_SOLICITUD;
}
