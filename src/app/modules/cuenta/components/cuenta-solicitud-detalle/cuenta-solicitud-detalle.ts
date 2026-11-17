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

const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const dia = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatearFecha = (fecha: string): string => {
  const partes = dia.formatToParts(new Date(fecha));
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? '';
  const mes = valor('month').replace('.', '');
  return `${valor('day')} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}, ${valor('year')}`;
};

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
    return solicitud ? formatearFecha(solicitud.fecha_solicitud) : '';
  });
  protected readonly seguimiento = computed(() => {
    const s = this.solicitud();
    if (!s) return [];
    const etapa = (texto: string, fecha: string | null, pendiente = false) => ({
      texto,
      fecha,
      fechaTexto: fecha ? formatearFecha(fecha) : null,
      pendiente,
    });
    const etapas = [etapa('Solicitud registrada', s.fecha_solicitud)];
    if (s.estado === 'pendiente') {
      etapas.push(etapa('En revisión', null, true));
    } else {
      etapas.push(etapa(s.estado === 'rechazado' ? 'Rechazada' : 'Aprobada', s.fecha_resolucion));
      if (s.estado === 'reembolsado') etapas.push(etapa('Reembolsada', s.fecha_reembolso));
    }
    return etapas;
  });
  protected readonly colorSeguimiento = computed(() => {
    const estado = this.solicitud()?.estado;
    return estado === 'rechazado'
      ? 'bg-primary'
      : estado === 'pendiente'
        ? 'bg-[#B7791F]'
        : 'bg-[#2E9E5B]';
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
