import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { CuentaSolicitudes } from '../cuenta-solicitudes/cuenta-solicitudes';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { SolicitudesStore } from '../../services/solicitudes-store';
import { CuentaSolicitudDetalle } from '../../components/cuenta-solicitud-detalle/cuenta-solicitud-detalle';

@Component({
  imports: [CuentaSolicitudes, CuentaNuevaSolicitud, CuentaSolicitudDetalle],
  providers: [SolicitudesStore],
  selector: 'app-cuenta-solicitudes-portal',
  templateUrl: './cuenta-solicitudes-portal.html',
})
export class CuentaSolicitudesPortal {
  protected readonly formularioAbierto = signal(false);
  protected readonly solicitudes = inject(SolicitudesStore);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    this.solicitudes.cargar();
    afterNextRender(() => {
      this.elemento.nativeElement
        .querySelector<HTMLElement>('#cuenta-solicitudes-titulo')
        ?.focus({ preventScroll: true });
    });
  }

  protected registrada(): void {
    this.formularioAbierto.set(false);
    this.solicitudes.cargar(1);
  }
}
