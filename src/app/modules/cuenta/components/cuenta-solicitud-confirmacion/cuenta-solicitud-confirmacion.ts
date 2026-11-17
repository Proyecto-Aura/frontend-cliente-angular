import { Component, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SolicitudVista } from '../../models/solicitud-vista.model';
import { CuentaSolicitudEstado } from '../cuenta-solicitud-estado/cuenta-solicitud-estado';

@Component({
  imports: [CurrencyPipe, CuentaSolicitudEstado],
  host: {
    role: 'status',
    tabindex: '-1',
    class:
      'mb-4 block rounded-lg border border-success/40 bg-success-50 p-4 text-xs text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-primary',
  },
  selector: 'app-cuenta-solicitud-confirmacion',
  templateUrl: './cuenta-solicitud-confirmacion.html',
})
export class CuentaSolicitudConfirmacion {
  readonly solicitud = input.required<SolicitudVista>();
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.elemento.nativeElement.focus());
  }
}
