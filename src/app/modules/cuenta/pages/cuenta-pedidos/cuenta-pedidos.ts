import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CuentaApi } from '../../services/cuenta-api';
import { CuentaPagoBadge } from '../../components/cuenta-pago-badge/cuenta-pago-badge';
import { CuentaEntregaBadge } from '../../components/cuenta-entrega-badge/cuenta-entrega-badge';

/** Historial de pedidos del cliente. Hija de cuenta-layout. */
@Component({
  selector: 'app-cuenta-pedidos',
  imports: [RouterLink, CuentaPagoBadge, CuentaEntregaBadge],
  host: { class: 'block' },
  templateUrl: './cuenta-pedidos.html',
})
export class CuentaPedidos {
  protected readonly api = inject(CuentaApi);

  /** Borde de la card según estado (pendiente / entregado / en curso). */
  protected borde(payment: string, delivery: string): string {
    if (payment === 'pending') return 'border-[#fde68a]';
    if (delivery === 'delivered') return 'border-[#bbf7d0]';
    return 'border-[#fca5a5]';
  }
}
