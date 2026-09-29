import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CarritoStore } from '../../../carrito/services/carrito-store';
import { UiAlert, UiButton, UiCard, UiInput } from '../../../../shared/ui';
import { DISTRITOS } from '../../../../shared/utils/constants';
import { MetodoPago, TipoComprobante } from '../../models/checkout.model';

/**
 * Página de checkout: dirección de entrega + comprobante + método de pago + resumen.
 * "Crear el pedido" hoy solo vacía el carrito y navega a /checkout/exito
 * (sin POST real ni pago con Culqi — pendiente de endpoint del backend).
 */
@Component({
  selector: 'app-checkout',
  imports: [RouterLink, NgOptimizedImage, DecimalPipe, UiAlert, UiButton, UiCard, UiInput],
  host: { class: 'block flex-1' },
  templateUrl: './checkout.html',
})
export class Checkout {
  private readonly router = inject(Router);
  protected readonly carrito = inject(CarritoStore);

  protected readonly distritos = DISTRITOS;
  protected readonly pasos = ['Carrito', 'Datos de entrega', 'Pago'];

  protected readonly nombre = signal('');
  protected readonly telefono = signal('');
  protected readonly direccion = signal('');
  protected readonly referencia = signal('');
  protected readonly distrito = signal('');
  protected readonly distOpen = signal(false);
  protected readonly comprobante = signal<TipoComprobante>('boleta');
  protected readonly ruc = signal('');
  protected readonly razonSocial = signal('');
  protected readonly metodoPago = signal<MetodoPago>('culqi');

  protected readonly puedeConfirmar = computed(
    () =>
      this.nombre().trim() !== '' &&
      this.telefono().trim() !== '' &&
      this.direccion().trim() !== '' &&
      this.distrito() !== '' &&
      (this.comprobante() === 'boleta' ||
        (this.ruc().trim() !== '' && this.razonSocial().trim() !== '')),
  );

  protected pickDistrito(d: string): void {
    this.distrito.set(d);
    this.distOpen.set(false);
  }

  protected confirmar(): void {
    if (!this.puedeConfirmar()) return;
    // TODO: POST /pedidos cuando exista el endpoint.
    this.carrito.clear();
    this.router.navigate(['/checkout/exito']);
  }
}
