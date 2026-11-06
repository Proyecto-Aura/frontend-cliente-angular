import { Component, inject, signal } from '@angular/core';
import { CuentaSolicitudes } from '../cuenta-solicitudes/cuenta-solicitudes';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { CuentaSolicitudConfirmacion } from '../../components/cuenta-solicitud-confirmacion/cuenta-solicitud-confirmacion';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';
import { SolicitudesStore } from '../../services/solicitudes-store';
import { CuentaSolicitudDetalle } from '../../components/cuenta-solicitud-detalle/cuenta-solicitud-detalle';

@Component({
  imports: [
    CuentaSolicitudes,
    CuentaNuevaSolicitud,
    CuentaSolicitudConfirmacion,
    CuentaSolicitudDetalle,
  ],
  providers: [SolicitudesStore],
  selector: 'app-cuenta-solicitudes-portal',
  templateUrl: './cuenta-solicitudes-portal.html',
})
export class CuentaSolicitudesPortal {
  protected readonly formularioAbierto = signal(false);
  protected readonly confirmacion = signal<SolicitudDetalle | null>(null);
  protected readonly solicitudes = inject(SolicitudesStore);

  constructor() {
    this.solicitudes.cargar();
  }

  protected registrada(solicitud: SolicitudDetalle): void {
    this.confirmacion.set(solicitud);
    this.formularioAbierto.set(false);
    this.solicitudes.cargar(1);
  }
}
