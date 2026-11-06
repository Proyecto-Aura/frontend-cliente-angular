import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';

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
  readonly solicitud = input.required<SolicitudDetalle>();
  readonly cerrar = output<void>();
  private readonly documento = inject(DOCUMENT);

  protected readonly monto = computed(() => moneda.format(this.solicitud().monto));
  protected readonly fechaSolicitud = computed(() =>
    dia.format(new Date(this.solicitud().fecha_solicitud)),
  );
  protected readonly fechaResolucion = computed(() => {
    const fecha = this.solicitud().fecha_resolucion;
    return fecha ? dia.format(new Date(fecha)) : null;
  });
  protected readonly etiquetaEstado = computed(
    () => SOLICITUD_ESTADOS[this.solicitud().estado].etiqueta,
  );
  protected readonly enlaceEvidencia = computed(() => {
    const evidencia = this.solicitud().evidencia;
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
}
