import { Component, signal } from '@angular/core';
import { CuentaSolicitudes } from '../cuenta-solicitudes/cuenta-solicitudes';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { CuentaSolicitudConfirmacion } from '../../components/cuenta-solicitud-confirmacion/cuenta-solicitud-confirmacion';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';

@Component({
  imports: [CuentaSolicitudes, CuentaNuevaSolicitud, CuentaSolicitudConfirmacion],
  selector: 'app-cuenta-solicitudes-portal',
  templateUrl: './cuenta-solicitudes-portal.html',
})
export class CuentaSolicitudesPortal {
  protected readonly formularioAbierto = signal(false);
  protected readonly confirmacion = signal<SolicitudDetalle | null>(null);

  protected registrada(solicitud: SolicitudDetalle): void {
    this.confirmacion.set(solicitud);
    this.formularioAbierto.set(false);
  }
}
