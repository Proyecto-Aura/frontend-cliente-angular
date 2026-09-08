import { Component, computed, input } from '@angular/core';

/** Etiqueta de stock: sin stock / pocas unidades / en stock. */
@Component({
  selector: 'app-catalogo-stock-badge',
  host: { class: 'inline-flex' },
  template: `
    @switch (nivel()) {
      @case ('agotado') {
        <span class="flex items-center gap-1 rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-semibold text-muted">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          Sin stock
        </span>
      }
      @case ('bajo') {
        <span class="flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] font-semibold text-[#b45309]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></svg>
          Solo {{ stock() }} disponibles
        </span>
      }
      @default {
        <span class="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700">
          En stock
        </span>
      }
    }
  `,
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
