import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

/** Confirmación de pedido creado. Muestra un número de pedido de ejemplo. */
@Component({
  selector: 'app-checkout-exito',
  imports: [RouterLink, NgOptimizedImage],
  host: { class: 'flex flex-1 items-center justify-center px-6 py-16' },
  template: `
    <div class="animate-fade-up flex max-w-[460px] flex-col items-center gap-6 text-center">
      <div class="relative">
        <span
          class="flex size-24 items-center justify-center rounded-full border-4 border-[#86efac] bg-success-50 text-success-700"
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>
        </span>
        <span class="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-brand-600">
          <img ngSrc="/francos-icon.png" alt="Franco's" width="20" height="20" class="size-5 object-contain" />
        </span>
      </div>

      <div class="flex flex-col gap-2">
        <h1 class="font-display text-[28px] font-black tracking-[-0.5px] text-ink sm:text-[32px]">
          ¡Pedido confirmado!
        </h1>
        <p class="text-[14px] leading-relaxed text-ink-soft">
          Tu pedido ha sido registrado exitosamente. Te notificaremos por email cuando esté en camino.
        </p>
      </div>

      <div class="flex w-full flex-col gap-3 rounded-2xl border border-[#f0f0f0] bg-surface px-8 py-5 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-semibold uppercase tracking-wide text-muted">Número de pedido</span>
          <span class="font-display text-[14px] font-black text-brand-600">{{ orderId }}</span>
        </div>
        <div class="h-px bg-[#f5f5f5]"></div>
        <div class="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
          <span class="text-[12px] font-medium text-label">Entrega estimada en 2–3 días hábiles</span>
        </div>
      </div>

      <a
        routerLink="/catalogo"
        class="flex h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-8 text-[14px] font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
        Seguir comprando
      </a>
    </div>
  `,
})
export class CheckoutExito {
  protected readonly orderId = `FRS-${Date.now().toString().slice(-6)}`;
}
