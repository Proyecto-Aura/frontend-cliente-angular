import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UiButton } from '../../../../shared/ui';

/** Confirmación de pedido creado. Muestra un número de pedido de ejemplo. */
@Component({
  selector: 'app-checkout-exito',
  imports: [RouterLink, NgOptimizedImage, UiButton],
  host: { class: 'flex flex-1 items-center justify-center px-6 py-16' },
  templateUrl: './checkout-exito.html',
})
export class CheckoutExito {
  protected readonly orderId = `FRS-${Date.now().toString().slice(-6)}`;
}
