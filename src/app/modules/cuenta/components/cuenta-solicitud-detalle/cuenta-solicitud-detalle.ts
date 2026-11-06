import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { CuentaDialogo } from '../cuenta-dialogo/cuenta-dialogo';
import { Icon } from '../../../../shared/ui/icon/icon';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';
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
  imports: [Icon, CuentaSolicitudEstado, CuentaDialogo],
  selector: 'app-cuenta-solicitud-detalle',
  templateUrl: './cuenta-solicitud-detalle.html',
})
export class CuentaSolicitudDetalle {
  readonly solicitud = input<SolicitudDetalle | null>(null);
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
  readonly reintentar = output<void>();
  readonly cerrar = output<void>();
  private readonly documento = inject(DOCUMENT);
  private readonly botonCerrar = viewChild<ElementRef<HTMLButtonElement>>('botonCerrar');
  private readonly estadoCarga = viewChild<ElementRef<HTMLElement>>('estadoCarga');
  private readonly errorCarga = viewChild<ElementRef<HTMLElement>>('errorCarga');
  protected readonly titulo = computed(() => {
    const solicitud = this.solicitud();
    return solicitud ? `Solicitud ${solicitud.codigo}` : 'Detalle de solicitud';
  });

  protected readonly monto = computed(() => {
    const solicitud = this.solicitud();
    return solicitud ? moneda.format(solicitud.monto) : '';
  });
  protected readonly fechaSolicitud = computed(() => {
    const solicitud = this.solicitud();
    return solicitud ? dia.format(new Date(solicitud.fecha_solicitud)) : '';
  });
  protected readonly fechaResolucion = computed(() => {
    const fecha = this.solicitud()?.fecha_resolucion;
    return fecha ? dia.format(new Date(fecha)) : null;
  });
  protected readonly etiquetaEstado = computed(() => {
    const solicitud = this.solicitud();
    return solicitud ? SOLICITUD_ESTADOS[solicitud.estado].etiqueta : '';
  });
  protected readonly enlaceEvidencia = computed(() => {
    const evidencia = this.solicitud()?.evidencia;
    if (!evidencia) return null;
    try {
      const url = new URL(evidencia.url);
      // blob solo del mismo origen: la demostración genera su PDF localmente.
      const permitido =
        ['https:', 'http:'].includes(url.protocol) ||
        (url.protocol === 'blob:' && url.origin === this.documento.location.origin);
      return permitido ? url.href : null;
    } catch {
      return null;
    }
  });

  constructor() {
    afterRenderEffect({
      write: () => {
        const destino = this.cargando()
          ? this.estadoCarga()
          : this.error()
            ? this.errorCarga()
            : this.solicitud()
              ? this.botonCerrar()
              : undefined;
        // La directiva captura el origen antes de abrir. Solo mover el foco de un modal ya abierto.
        if (this.botonCerrar()?.nativeElement.closest('dialog')?.open) {
          destino?.nativeElement.focus({ preventScroll: true });
        }
      },
    });
  }
}
