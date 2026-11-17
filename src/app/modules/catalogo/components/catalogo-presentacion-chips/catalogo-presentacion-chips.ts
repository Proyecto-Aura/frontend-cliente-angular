import { Component, input, output } from '@angular/core';

import { PresentacionCatalogo } from '../../models/catalogo.model';
import { etiquetaPresentacion } from '../../utils/catalogo.utils';

/**
 * Presentaciones de un producto como píldoras (prototipo). Las que no tienen
 * stock salen tachadas y no se pueden elegir.
 */
@Component({
  selector: 'app-catalogo-presentacion-chips',
  host: { class: 'flex flex-wrap gap-1.5', role: 'group', 'aria-label': 'Presentaciones' },
  templateUrl: './catalogo-presentacion-chips.html',
})
export class CatalogoPresentacionChips {
  readonly presentaciones = input.required<PresentacionCatalogo[]>();
  readonly seleccionadaId = input.required<number>();

  readonly elegir = output<number>();

  protected readonly etiqueta = etiquetaPresentacion;
}
