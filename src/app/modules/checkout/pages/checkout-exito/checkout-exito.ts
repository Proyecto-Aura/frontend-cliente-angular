import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { PedidoPagado } from '../../models/checkout.model';

/**
 * Pedido pagado (HU-B-008, RF-B26 y RF-B28): confirma el resultado del pago y
 * muestra el pedido como "Pagado". El pedido llega en el estado de la
 * navegación desde el checkout; si se entra sin él (enlace directo) se vuelve al
 * catálogo. Ver el historial de pedidos es de otra HU (HU-B-011).
 */
@Component({
  selector: 'app-checkout-exito',
  imports: [RouterLink, Icon],
  host: { class: 'block min-h-[calc(100vh-64px)] bg-[#f7f7f7]' },
  templateUrl: './checkout-exito.html',
})
export class CheckoutExito {
  private readonly router = inject(Router);

  protected readonly pedido: PedidoPagado | null = leerPedido();
  protected readonly precio = formatearPrecio;

  constructor() {
    if (!this.pedido) void this.router.navigate(['/catalogo'], { replaceUrl: true });
  }
}

/** El pedido que dejó el checkout en el estado de la navegación (sobrevive a recargar). */
function leerPedido(): PedidoPagado | null {
  const estado = history.state as { pedido?: PedidoPagado } | null;
  return estado?.pedido?.codigo ? estado.pedido : null;
}
