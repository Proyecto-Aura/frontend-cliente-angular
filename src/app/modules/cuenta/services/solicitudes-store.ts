import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { PaginaSolicitudes, SolicitudResumen } from '../models/solicitud-portal.model';
import { SolicitudDetalle } from '../models/solicitud-detalle.model';
import { ReembolsosApi } from './reembolsos-api';

/** Estado aislado por página. No guarda datos del cliente ni enlaces firmados en storage. */
@Injectable()
export class SolicitudesStore {
  private readonly api = inject(ReembolsosApi);
  private peticionLista: Subscription | undefined;
  private peticionDetalle: Subscription | undefined;
  readonly pagina = signal(1);
  readonly meta = signal<PaginaSolicitudes['meta'] | null>(null);
  readonly solicitudes = signal<readonly SolicitudResumen[] | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly detalleId = signal<number | null>(null);
  readonly detalle = signal<SolicitudDetalle | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly errorDetalle = signal<string | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.peticionLista?.unsubscribe();
      this.peticionDetalle?.unsubscribe();
    });
  }

  cargar(pagina = this.pagina()): void {
    if (!Number.isInteger(pagina) || pagina < 1) return;
    this.peticionLista?.unsubscribe();
    this.cerrarDetalle();
    this.pagina.set(pagina);
    this.cargando.set(true);
    this.error.set(null);
    this.solicitudes.set(null);
    this.peticionLista = this.api.listar(pagina).subscribe({
      next: (respuesta) => {
        this.solicitudes.set(respuesta.data);
        this.meta.set(respuesta.meta);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.meta.set(null);
        this.error.set(this.mensajeError(error, 'No pudimos consultar tus solicitudes.'));
        this.cargando.set(false);
      },
    });
  }

  abrirDetalle(id: number): void {
    if (!Number.isInteger(id) || id < 1) return;
    this.peticionDetalle?.unsubscribe();
    this.detalleId.set(id);
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.cargandoDetalle.set(true);
    // Se consulta en cada apertura: las URLs de evidencia vencen en unos minutos.
    this.peticionDetalle = this.api.detalle(id).subscribe({
      next: (solicitud) => {
        this.detalle.set(solicitud);
        this.cargandoDetalle.set(false);
      },
      error: (error: unknown) => {
        this.errorDetalle.set(
          this.mensajeError(error, 'No pudimos consultar el detalle de la solicitud.'),
        );
        this.cargandoDetalle.set(false);
      },
    });
  }

  cerrarDetalle(): void {
    this.peticionDetalle?.unsubscribe();
    this.detalleId.set(null);
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.cargandoDetalle.set(false);
  }

  private mensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401)
        return 'Tu sesión ha vencido. Vuelve a iniciar sesión para consultar tus solicitudes.';
      if (error.status === 403)
        return 'No tienes permiso para consultar estas solicitudes. Verifica tu sesión de cliente.';
      if (error.status === 404)
        return 'La información consultada ya no está disponible para tu cuenta.';
      if (error.status >= 500) return fallback;
    }
    return apiErrorMessage(error, fallback);
  }
}
