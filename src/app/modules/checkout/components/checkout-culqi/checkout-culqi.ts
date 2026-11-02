import { Component, ElementRef, inject, input, output, signal } from '@angular/core';

import { Icon, IconName } from '../../../../shared/ui/icon/icon';
import { formatearPrecio } from '../../../catalogo/utils/catalogo.utils';
import { MedioPago } from '../../models/checkout.model';
import { ResultadoSimulado, tokenSimulado } from '../../utils/checkout.utils';

interface OpcionPago {
  medio: MedioPago;
  etiqueta: string;
  icono: IconName;
}

/**
 * Ventana "Pagar con Culqi" (HU-B-008, RF-B24): tarjeta, Yape o Plin. Es una
 * SIMULACIÓN, como en el prototipo: el proyecto aún no tiene llaves de Culqi, así
 * que no pide datos de tarjeta ni hace ningún cargo. Entrega un token simulado
 * que el backend (CULQI_SIMULADO=true) aprueba o rechaza. Cuando se conecte
 * Culqi se cambia esta ventana por su checkout y el contrato (`pagar(token)`)
 * sigue igual.
 */
@Component({
  selector: 'app-checkout-culqi',
  imports: [Icon],
  host: {
    class: 'fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,33,33,0.45)] p-4',
    '(click)': 'alClicFuera($event)',
    '(document:keydown.escape)': 'cerrarSiLibre()',
  },
  templateUrl: './checkout-culqi.html',
})
export class CheckoutCulqi {
  /** Lo que se va a cobrar, el que calculó el servidor. */
  readonly total = input.required<number>();
  /** Se está esperando la respuesta del cobro. */
  readonly procesando = input(false);
  /** Motivo del último rechazo; con él se puede reintentar sin salir de la ventana. */
  readonly error = input<string | null>(null);

  readonly pagar = output<string>();
  readonly cerrar = output<void>();

  protected readonly precio = formatearPrecio;
  protected readonly opciones: OpcionPago[] = [
    { medio: 'tarjeta', etiqueta: 'Tarjeta', icono: 'credit-card' },
    { medio: 'yape', etiqueta: 'Yape', icono: 'qr-code' },
    { medio: 'plin', etiqueta: 'Plin', icono: 'qr-code' },
  ];
  protected readonly medio = signal<MedioPago>('tarjeta');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected elegir(medio: MedioPago): void {
    if (!this.procesando()) this.medio.set(medio);
  }

  protected simular(resultado: ResultadoSimulado): void {
    if (this.procesando()) return;
    this.pagar.emit(tokenSimulado(resultado, this.medio()));
  }

  protected cerrarSiLibre(): void {
    if (!this.procesando()) this.cerrar.emit();
  }

  /** Un clic en el fondo oscuro (fuera de la ventana) cierra, salvo que se esté cobrando. */
  protected alClicFuera(event: MouseEvent): void {
    if (event.target === this.host.nativeElement) this.cerrarSiLibre();
  }
}
