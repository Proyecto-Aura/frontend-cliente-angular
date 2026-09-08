import { Component, input } from '@angular/core';

import { EstadoPago } from '../../models/pedido.model';

/** Estado de pago del pedido: pendiente / pagado. */
@Component({
  selector: 'app-cuenta-pago-badge',
  host: { class: 'inline-flex' },
  template: `
    @if (status() === 'pending') {
      <span class="flex items-center gap-1 rounded-full bg-[#fefce8] px-2.5 py-1 text-[11px] font-bold text-[#a16207]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        Pendiente
      </span>
    } @else {
      <span class="flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-bold text-success-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>
        Pagado
      </span>
    }
  `,
})
export class CuentaPagoBadge {
  readonly status = input.required<EstadoPago>();
}
