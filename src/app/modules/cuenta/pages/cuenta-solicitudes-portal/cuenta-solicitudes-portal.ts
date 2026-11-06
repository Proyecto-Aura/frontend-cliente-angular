import { Component, signal } from '@angular/core';
import { CuentaSolicitudes } from '../cuenta-solicitudes/cuenta-solicitudes';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';

@Component({
  imports: [CuentaSolicitudes, CuentaNuevaSolicitud],
  selector: 'app-cuenta-solicitudes-portal',
  templateUrl: './cuenta-solicitudes-portal.html',
})
export class CuentaSolicitudesPortal {
  protected readonly formularioAbierto = signal(false);
}
