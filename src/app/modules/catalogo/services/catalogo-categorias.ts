import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { CategoriaCatalogo } from '../models/catalogo.model';
import { categoriasDe } from '../utils/catalogo.utils';
import { CatalogoApi } from './catalogo-api';

/**
 * Categorías que tienen productos en el catálogo: el filtro del catálogo y el
 * footer. `/categorias` es solo para el personal, así que salen del catálogo.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoCategorias {
  readonly lista = toSignal(
    inject(CatalogoApi)
      .listar({ q: '', categoriaId: null, orden: null })
      .pipe(
        map(categoriasDe),
        catchError(() => of<CategoriaCatalogo[]>([])),
      ),
    { initialValue: [] },
  );
}
