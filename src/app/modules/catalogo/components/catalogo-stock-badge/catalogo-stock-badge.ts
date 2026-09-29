import { Component, computed, input } from '@angular/core';

import { UiBadge } from '../../../../shared/ui';

/** Etiqueta de stock: sin stock / pocas unidades / en stock. */
@Component({
  selector: 'app-catalogo-stock-badge',
  imports: [UiBadge],
  host: { class: 'inline-flex' },
  templateUrl: './catalogo-stock-badge.html',
})
export class CatalogoStockBadge {
  readonly stock = input.required<number>();

  protected readonly nivel = computed<'agotado' | 'bajo' | 'ok'>(() => {
    const s = this.stock();
    if (s <= 0) return 'agotado';
    if (s <= 3) return 'bajo';
    return 'ok';
  });
}
