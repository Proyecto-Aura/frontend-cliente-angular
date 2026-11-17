import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  FiltrosCatalogo,
  ItemCatalogo,
  PaginaCatalogo,
  ProductoCatalogo,
} from '../models/catalogo.model';

/** Máximo que acepta el backend por página. */
const POR_PAGINA = 100;

/** Cliente HTTP del catálogo público (`/api/v1/catalogo`, HU-B-005). */
@Injectable({ providedIn: 'root' })
export class CatalogoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/catalogo`;

  /**
   * Todas las presentaciones visibles que cumplen los filtros. Se piden todas
   * las páginas porque la tienda agrupa por producto y un producto no puede
   * quedar partido entre páginas.
   */
  listar(filtros: FiltrosCatalogo): Observable<ItemCatalogo[]> {
    return this.pagina(filtros, 1).pipe(
      switchMap((primera) => {
        const resto = Array.from({ length: primera.meta.total_pages - 1 }, (_, i) =>
          this.pagina(filtros, i + 2),
        );
        return resto.length
          ? forkJoin(resto).pipe(map((paginas) => [primera, ...paginas]))
          : of([primera]);
      }),
      map((paginas) => paginas.flatMap((p) => p.data)),
    );
  }

  /** Detalle de un producto con sus presentaciones y promociones vigentes. */
  obtener(id: number): Observable<ProductoCatalogo> {
    return this.http.get<ProductoCatalogo>(`${this.base}/productos/${id}`);
  }

  private pagina(filtros: FiltrosCatalogo, page: number): Observable<PaginaCatalogo> {
    let params = new HttpParams().set('page', page).set('limit', POR_PAGINA);
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.categoriaId !== null) params = params.set('categoria_id', filtros.categoriaId);
    if (filtros.orden) params = params.set('orden', filtros.orden);
    return this.http.get<PaginaCatalogo>(`${this.base}/productos`, { params });
  }
}
