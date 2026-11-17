import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CuentaSolicitudes } from '../../pages/cuenta-solicitudes/cuenta-solicitudes';
import { CuentaSolicitudDetalle } from '../../components/cuenta-solicitud-detalle/cuenta-solicitud-detalle';
import { CuentaSolicitudFormulario } from '../../components/cuenta-solicitud-formulario/cuenta-solicitud-formulario';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';
import { DETALLES_DEMO, PEDIDOS_FORM_DEMO, SOLICITUDES_DEMO } from '../solicitudes-data';
import { crearEvidenciaDemo } from '../evidencia-demo';

@Component({
  imports: [CuentaSolicitudes, CuentaSolicitudDetalle, CuentaSolicitudFormulario, RouterLink],
  selector: 'app-cuenta-solicitudes-demo',
  template: `
    <aside
      aria-label="Demostración visual"
      class="mb-5 rounded-lg border border-info/40 bg-info-50 p-3 text-xs leading-relaxed text-info-700"
    >
      <p class="m-0 font-bold">Demostración visual · Datos de ejemplo</p>
      <p class="mt-1 mb-0">
        Estos registros no pertenecen a tu cuenta. No se consultan ni se guardan solicitudes.
      </p>
      <a
        routerLink="/mi-cuenta/solicitudes"
        class="mt-2 inline-block font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >Volver a Mis Solicitudes</a
      >
    </aside>
    @if (aviso()) {
      <p role="status" class="mb-4 rounded-lg bg-info-50 p-3 text-xs text-info-700">
        {{ aviso() }}
      </p>
    }
    <app-cuenta-solicitudes
      [solicitudes]="solicitudes"
      [accionesDisponibles]="true"
      (nuevaSolicitud)="formularioAbierto.set(true)"
      (verDetalle)="abrirDetalle($event)"
    />
    @if (detalle(); as solicitud) {
      <app-cuenta-solicitud-detalle [solicitud]="solicitud" (cerrar)="detalle.set(null)" />
    }
    @if (formularioAbierto()) {
      <app-cuenta-solicitud-formulario
        [pedidos]="pedidosFormulario"
        [demostracion]="true"
        (cerrar)="formularioAbierto.set(false)"
      />
    }
  `,
})
export class CuentaSolicitudesDemo {
  protected readonly solicitudes = SOLICITUDES_DEMO;
  protected readonly aviso = signal('');
  protected readonly detalle = signal<SolicitudDetalle | null>(null);
  protected readonly formularioAbierto = signal(false);
  protected readonly pedidosFormulario = PEDIDOS_FORM_DEMO;
  private readonly evidenciaUrl = URL.createObjectURL(crearEvidenciaDemo());

  constructor() {
    inject(DestroyRef).onDestroy(() => URL.revokeObjectURL(this.evidenciaUrl));
  }

  protected abrirDetalle(id: number): void {
    const solicitud = DETALLES_DEMO.find((s) => s.id === id);
    if (!solicitud) return;
    this.aviso.set('');
    this.detalle.set({
      ...solicitud,
      evidencia: solicitud.evidencia ? { ...solicitud.evidencia, url: this.evidenciaUrl } : null,
    });
  }
}
