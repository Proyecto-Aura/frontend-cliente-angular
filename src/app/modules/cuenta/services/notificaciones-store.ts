import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { NotificacionPortal, PaginaNotificaciones } from '../models/notificacion-portal.model';
import { NotificacionesApi } from './notificaciones-api';

/** Vive solo en Mi cuenta; no persiste mensajes del cliente. */
@Injectable()
export class NotificacionesStore {
  private readonly api = inject(NotificacionesApi);
  private readonly destroyRef = inject(DestroyRef);
  private consulta: Subscription | undefined;
  readonly pagina = signal(1);
  readonly meta = signal<PaginaNotificaciones['meta'] | null>(null);
  readonly notificaciones = signal<readonly NotificacionPortal[] | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly marcando = signal<ReadonlySet<number>>(new Set());
  readonly erroresLectura = signal<Readonly<Record<number, string>>>({});
  readonly avisoLectura = signal('');
  readonly sinLeerEnPagina = computed(
    () => this.notificaciones()?.filter((n) => !n.leido).length ?? 0,
  );
  readonly ocupada = computed(() => this.cargando() || this.marcando().size > 0);

  constructor() {
    this.destroyRef.onDestroy(() => this.consulta?.unsubscribe());
  }

  cargar(pagina = this.pagina()): void {
    if (!Number.isInteger(pagina) || pagina < 1 || this.marcando().size) return;
    this.consulta?.unsubscribe();
    this.pagina.set(pagina);
    this.cargando.set(true);
    this.error.set(null);
    this.notificaciones.set(null);
    this.erroresLectura.set({});
    this.avisoLectura.set('');
    this.consulta = this.api.listar(pagina).subscribe({
      next: (respuesta) => {
        this.notificaciones.set(respuesta.data);
        this.meta.set(respuesta.meta);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.meta.set(null);
        this.error.set(
          this.mensajeError(error, 'No pudimos consultar tus notificaciones. Vuelve a intentarlo.'),
        );
        this.cargando.set(false);
      },
    });
  }

  marcarLeida(id: number): void {
    const notificacion = this.notificaciones()?.find((n) => n.id === id);
    if (
      !notificacion ||
      notificacion.leido ||
      this.cargando() ||
      this.marcando().has(id) ||
      this.erroresLectura()[id]
    )
      return;
    this.marcando.update((ids) => new Set([...ids, id]));
    this.avisoLectura.set('');
    // PATCH no es idempotente: ni reintentar automáticamente ni anunciar lectura sin confirmar.
    this.api
      .marcarLeida(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificaciones.update(
            (lista) => lista?.map((n) => (n.id === id ? { ...n, leido: true } : n)) ?? null,
          );
          this.avisoLectura.set('Notificación marcada como leída.');
          this.terminarLectura(id);
        },
        error: (error: unknown) => {
          const mensaje =
            error instanceof HttpErrorResponse && error.status === 404
              ? 'La notificación puede estar leída o ya no estar disponible. Actualiza los avisos para comprobarlo.'
              : this.mensajeError(
                  error,
                  'No pudimos confirmar la lectura. Actualiza los avisos antes de volver a intentarlo.',
                );
          this.erroresLectura.update((errores) => ({ ...errores, [id]: mensaje }));
          this.terminarLectura(id);
        },
      });
  }

  private terminarLectura(id: number): void {
    this.marcando.update((ids) => new Set([...ids].filter((actual) => actual !== id)));
  }

  private mensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401)
        return 'Tu sesión ha vencido. Vuelve a iniciar sesión para consultar tus notificaciones.';
      if (error.status === 403)
        return 'No tienes permiso para consultar estas notificaciones. Verifica tu sesión de cliente.';
      if (error.status === 0)
        return 'No se pudo conectar con el servidor. Actualiza los avisos cuando recuperes la conexión.';
    }
    return fallback;
  }
}
