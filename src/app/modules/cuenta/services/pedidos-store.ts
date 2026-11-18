import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Avisos } from '../../../shared/ui/aviso/aviso';
import { apiErrorMessage } from '../../../shared/utils/api-error';
import { PaginaPedidos, PedidoPortalVista } from '../models/pedido-portal.model';
import { esPedidoElegible, pedidoParaReembolso } from '../models/solicitud-formulario.model';
import { PedidosApi } from './pedidos-api';

/** Una instancia por página o formulario: no comparte datos entre sesiones. */
@Injectable()
export class PedidosStore {
  private readonly api = inject(PedidosApi);
  private readonly avisos = inject(Avisos);
  private peticion: Subscription | undefined;
  readonly pagina = signal(1);
  readonly meta = signal<PaginaPedidos['meta'] | null>(null);
  readonly filas = signal<readonly PedidoPortalVista[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  /** Id del pedido que se está cancelando; null si ninguno. */
  readonly cancelando = signal<number | null>(null);
  readonly opciones = computed(() =>
    this.filas().flatMap((fila) => {
      const pedido = pedidoParaReembolso(fila);
      return pedido ? [pedido] : [];
    }),
  );
  readonly hayElegibles = computed(() => this.opciones().some(esPedidoElegible));
  readonly detalleIncompleto = computed(() => this.filas().some((p) => p.errorDetalle));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.peticion?.unsubscribe());
  }

  cargar(pagina = this.pagina()): void {
    if (!Number.isInteger(pagina) || pagina < 1) return;
    this.peticion?.unsubscribe();
    this.pagina.set(pagina);
    this.cargando.set(true);
    this.error.set(null);
    this.filas.set([]);
    this.peticion = this.api
      .listar(pagina)
      .pipe(
        switchMap((res) => {
          // Máximo diez detalles por página. No se inventan productos ni pagos del resumen.
          const detalles = res.data.map((resumen) =>
            this.api.detalle(resumen.id).pipe(
              map((detalle): PedidoPortalVista => ({ resumen, detalle, errorDetalle: null })),
              catchError((err: unknown) =>
                of<PedidoPortalVista>({
                  resumen,
                  detalle: null,
                  errorDetalle: this.mensajeError(err, 'No pudimos verificar este pedido.'),
                }),
              ),
            ),
          );
          return (detalles.length ? forkJoin(detalles) : of([])).pipe(
            map((filas) => ({ filas, meta: res.meta })),
          );
        }),
      )
      .subscribe({
        next: ({ filas, meta }) => {
          this.filas.set(filas);
          this.meta.set(meta);
          this.cargando.set(false);
        },
        error: (err: unknown) => {
          this.error.set(this.mensajeError(err, 'No pudimos cargar tus pedidos.'));
          this.meta.set(null);
          this.cargando.set(false);
        },
      });
  }

  /** Solo funciona si el pedido sigue en `confirmado`; refresca la lista pase lo que pase. */
  cancelar(id: number): void {
    const pedido = this.filas().find((p) => p.resumen.id === id);
    this.cancelando.set(id);
    this.api.cancelar(id).subscribe({
      next: () => {
        this.cancelando.set(null);
        this.avisos.mostrar(
          'Pedido cancelado',
          pedido ? `Tu pedido ${pedido.resumen.codigo} fue cancelado.` : undefined,
        );
        this.cargar(this.pagina());
      },
      error: (err: unknown) => {
        this.cancelando.set(null);
        this.avisos.mostrar(
          'No se pudo cancelar',
          apiErrorMessage(err, 'Inténtalo de nuevo en unos segundos.'),
          'error',
        );
        // El 409 significa que el pedido ya avanzó de estado: refrescar para no dejar
        // el botón de cancelar visible sobre un pedido que ya no se puede cancelar.
        this.cargar(this.pagina());
      },
    });
  }

  private mensajeError(err: unknown, fallback: string): string {
    return err instanceof HttpErrorResponse && err.status === 401
      ? 'Tu sesión ha vencido. Vuelve a iniciar sesión para consultar tus pedidos.'
      : apiErrorMessage(err, fallback);
  }
}
