import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CrearPedidoRequest,
  PedidoPagado,
  ResumenPedido,
  ResumenPedidoRequest,
} from '../models/checkout.model';

/**
 * Resumen del pedido antes de pagar (HU-B-007, solo calcula) y pago del pedido
 * (HU-B-008: cobra y, si el pago se confirma, crea el pedido).
 */
@Injectable({ providedIn: 'root' })
export class CheckoutApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/portal/pedidos`;

  resumir(pedido: ResumenPedidoRequest): Observable<ResumenPedido> {
    return this.http.post<ResumenPedido>(`${this.url}/resumen`, pedido);
  }

  /** Cobra con el token de Culqi. Un 402 es un pago rechazado: no se crea nada y se puede reintentar. */
  pagar(pedido: CrearPedidoRequest): Observable<PedidoPagado> {
    return this.http.post<PedidoPagado>(this.url, pedido);
  }
}
