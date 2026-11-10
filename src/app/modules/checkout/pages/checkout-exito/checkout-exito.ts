import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { PedidoPagado } from '../../models/checkout.model';
import { CheckoutApi } from '../../services/checkout-api';
import { etiquetaComprobante } from '../../utils/checkout.utils';

const ETIQUETA_ESTADO: Record<string, string> = {
  confirmado: 'Confirmado',
};

/**
 * Pedido y su estado (HU-B-013, RF-B37; antes HU-B-008, RF-B26 y RF-B28), con la
 * boleta o factura emitida al pagar (HU-B-010, RF-B30 y RF-B31): carga
 * el pedido propio por su id desde el backend y muestra su estado, "Confirmado"
 * una vez que el pago se completa. Al leerlo del servidor sobrevive a recargar la
 * página. Ver el historial de pedidos es de otra HU (HU-B-011).
 */
@Component({
  selector: 'app-checkout-exito',
  imports: [RouterLink, Icon],
  host: { class: 'block min-h-[calc(100vh-64px)] bg-[#f7f7f7]' },
  templateUrl: './checkout-exito.html',
})
export class CheckoutExito {
  private readonly api = inject(CheckoutApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly pedido = signal<PedidoPagado | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly noEncontrado = signal(false);
  protected readonly precio = formatearPrecio;
  protected readonly etiquetaComprobante = etiquetaComprobante;

  constructor() {
    this.cargar();
  }

  protected etiqueta(estado: string): string {
    return ETIQUETA_ESTADO[estado] ?? estado.replaceAll('_', ' ');
  }

  protected cargar(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.noEncontrado.set(true);
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.api
      .consultar(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pedido) => {
          this.pedido.set(pedido);
          this.cargando.set(false);
        },
        error: (err: unknown) => {
          this.cargando.set(false);
          if (err instanceof HttpErrorResponse && err.status === 404) {
            this.noEncontrado.set(true);
            return;
          }
          this.error.set(apiErrorMessage(err, 'No pudimos cargar tu pedido. Inténtalo de nuevo.'));
        },
      });
  }
}
