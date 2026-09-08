import { Injectable } from '@angular/core';

import { Producto } from '../models/producto.model';
import { CATEGORIAS, ORDENAMIENTOS, PRESENTACIONES, PRODUCTOS_MOCK } from './catalogo.mock';

/**
 * Acceso a datos del catálogo. Hoy devuelve la data de ejemplo del prototipo;
 * cuando exista `GET /productos` en el backend se cambia solo esta clase.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoApi {
  readonly categorias = CATEGORIAS;
  readonly presentaciones = PRESENTACIONES;
  readonly ordenamientos = ORDENAMIENTOS;

  listarProductos(): Producto[] {
    return PRODUCTOS_MOCK;
  }
}
