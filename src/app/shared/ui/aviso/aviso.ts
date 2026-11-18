import { Component, Injectable, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { Alert, AlertTone } from '../alert/alert';
import { CarritoStore } from '../../../modules/carrito/services/carrito-store';

/** Enlace opcional dentro del aviso (p. ej. "Reenviar correo de verificación"). */
export interface AvisoEnlace {
  etiqueta: string;
  ruta: string;
  queryParams?: Record<string, string>;
}

export interface AvisoVisible {
  titulo: string;
  detalle?: string;
  tono: AlertTone;
  enlace?: AvisoEnlace;
}

/** Tiempo en pantalla antes de autocerrarse. */
export const DURACION_AVISO_MS = 4500;
/** Tiempo de la transición de salida antes de desmontar la alerta. */
export const DURACION_SALIDA_AVISO_MS = 300;

/**
 * Toast flotante (arriba a la derecha, entra deslizando, se autocierra): el
 * mismo patrón en toda la app, montado una sola vez en la raíz (`app.html`).
 * `tono` por defecto es "success" para no romper a quien ya llama `mostrar`
 * sin pasarlo.
 */
@Injectable({ providedIn: 'root' })
export class Avisos {
  readonly actual = signal<AvisoVisible | null>(null);
  readonly visible = signal(false);
  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private temporizadorSalida: ReturnType<typeof setTimeout> | undefined;

  mostrar(
    titulo: string,
    detalle?: string,
    tono: AlertTone = 'success',
    enlace?: AvisoEnlace,
    duracionMs = DURACION_AVISO_MS,
  ): void {
    clearTimeout(this.temporizador);
    clearTimeout(this.temporizadorSalida);
    this.actual.set({ titulo, detalle, tono, enlace });
    this.visible.set(false);
    // Doble rAF: deja pintar la posición inicial (fuera de pantalla) antes de animar.
    requestAnimationFrame(() => requestAnimationFrame(() => this.visible.set(true)));
    this.temporizador = setTimeout(() => this.cerrar(), duracionMs);
  }

  cerrar(): void {
    clearTimeout(this.temporizador);
    this.visible.set(false);
    this.temporizadorSalida = setTimeout(() => this.actual.set(null), DURACION_SALIDA_AVISO_MS);
  }
}

@Component({
  selector: 'app-aviso',
  imports: [Alert, RouterLink],
  templateUrl: './aviso.html',
})
export class Aviso {
  protected readonly avisos = inject(Avisos);

  private readonly router = inject(Router);
  /** En auth (login, registro…) no hay header que tape: el toast va más arriba. */
  protected readonly enAuth = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/auth')),
    ),
    { initialValue: this.router.url.startsWith('/auth') },
  );

  constructor() {
    // El carrito se abre encima: que no quede un toast tapado detrás.
    const carrito = inject(CarritoStore);
    effect(() => {
      if (carrito.abierto()) this.avisos.cerrar();
    });
  }
}
