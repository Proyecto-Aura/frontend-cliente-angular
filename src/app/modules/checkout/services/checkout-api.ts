import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ResumenPedido, ResumenPedidoRequest } from '../models/checkout.model';

/**
 * Resumen del pedido antes de pagar (HU-B-007). Solo calcula: no registra el
 * pedido ni cobra; eso llega con el pago (HU-B-008).
 */
@Injectable({ providedIn: 'root' })
export class CheckoutApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/portal/pedidos/resumen`;

  resumir(pedido: ResumenPedidoRequest): Observable<ResumenPedido> {
    return this.http.post<ResumenPedido>(this.url, pedido);
  }
}
