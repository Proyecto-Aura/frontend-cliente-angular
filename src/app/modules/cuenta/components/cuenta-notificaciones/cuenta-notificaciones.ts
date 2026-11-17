import { DOCUMENT } from '@angular/common';
import { Component, afterRenderEffect, computed, inject } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { reembolsoDeNotificacion } from '../../models/notificacion-portal.model';
import { NotificacionesStore } from '../../services/notificaciones-store';
import { SolicitudesStore } from '../../services/solicitudes-store';
import { CuentaSolicitudDetalle } from '../cuenta-solicitud-detalle/cuenta-solicitud-detalle';

const fecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

@Component({
  imports: [Icon, CuentaSolicitudDetalle],
  providers: [NotificacionesStore, SolicitudesStore],
  selector: 'app-cuenta-notificaciones',
  templateUrl: './cuenta-notificaciones.html',
  host: {
    '(window:focus)': 'actualizarAlVolver()',
    '(document:visibilitychange)': 'actualizarAlVolver()',
  },
})
export class CuentaNotificaciones {
  protected readonly avisos = inject(NotificacionesStore);
  protected readonly detalle = inject(SolicitudesStore);
  private readonly documento = inject(DOCUMENT);
  private ultimaConsulta = 0;
  private origenLectura: { id: number; boton: HTMLButtonElement } | null = null;
  protected readonly filas = computed(
    () =>
      this.avisos.notificaciones()?.map((aviso) => ({
        aviso,
        solicitudId: reembolsoDeNotificacion(aviso),
        fecha: fecha.format(new Date(aviso.created_at)),
      })) ?? [],
  );

  constructor() {
    this.actualizar(1);
    afterRenderEffect({
      write: () => {
        const notificaciones = this.avisos.notificaciones();
        const errores = this.avisos.erroresLectura();
        const origen = this.origenLectura;
        if (!origen) return;
        const leida = notificaciones?.find((n) => n.id === origen.id)?.leido;
        if (!leida && !errores[origen.id]) return;
        // Al desaparecer la acción leída, conservar una posición útil para teclado.
        if (
          this.documento.activeElement === this.documento.body ||
          this.documento.activeElement === origen.boton
        ) {
          this.documento
            .getElementById(`${leida ? 'notificacion' : 'error-lectura'}-${origen.id}`)
            ?.focus({ preventScroll: true });
        }
        this.origenLectura = null;
      },
    });
  }

  protected marcarLeida(id: number, event: Event): void {
    this.origenLectura = { id, boton: event.currentTarget as HTMLButtonElement };
    this.avisos.marcarLeida(id);
  }

  protected actualizar(pagina = this.avisos.pagina()): void {
    if (this.avisos.ocupada()) return;
    this.ultimaConsulta = Date.now();
    this.avisos.cargar(pagina);
  }

  protected mostrarAvisos(event: Event): void {
    if ((event.target as HTMLDetailsElement).open) this.actualizar(1);
  }

  protected actualizarAlVolver(): void {
    if (this.documento.querySelector('dialog[open]')) return;
    if (this.documento.visibilityState === 'visible' && Date.now() - this.ultimaConsulta >= 30_000)
      this.actualizar();
  }
}
