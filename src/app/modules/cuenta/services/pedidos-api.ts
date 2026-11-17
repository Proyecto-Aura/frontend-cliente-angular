import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PaginaPedidos, PedidoPortalDetalle } from '../models/pedido-portal.model';

@Service()
export class PedidosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/portal/pedidos`;

  listar(page = 1) {
    return this.http.get<PaginaPedidos>(this.url, { params: { page, limit: 10 } });
  }

  detalle(id: number) {
    return this.http.get<PedidoPortalDetalle>(`${this.url}/${id}`);
  }

  /** Solo funciona mientras el pedido está en `confirmado`; 409 si ya pasó a preparación. */
  cancelar(id: number) {
    return this.http.patch<PedidoPortalDetalle>(`${this.url}/${id}/cancelar`, {});
  }
}
