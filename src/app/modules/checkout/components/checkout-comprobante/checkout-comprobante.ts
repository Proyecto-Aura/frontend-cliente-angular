import { Component, computed, input, model, signal } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { TipoComprobante } from '../../models/checkout.model';
import { RAZON_SOCIAL_MAXIMA, erroresDeComprobante } from '../../utils/checkout.utils';

interface OpcionComprobante {
  tipo: TipoComprobante;
  etiqueta: string;
  detalle: string;
}

const OPCIONES: OpcionComprobante[] = [
  { tipo: 'boleta', etiqueta: 'Boleta', detalle: 'Para personas naturales' },
  { tipo: 'factura', etiqueta: 'Factura', detalle: 'Para empresas con RUC' },
];

/**
 * "Comprobante de pago" del checkout (HU-B-009, RF-B29): el cliente elige
 * boleta o factura. Con factura ingresa RUC y razón social, que se validan como
 * en el backend. La página guarda la elección y la valida con el servidor
 * antes de pagar; aquí solo se elige y se muestran los errores.
 */
@Component({
  selector: 'app-checkout-comprobante',
  imports: [Icon],
  host: { class: 'block rounded-xl border border-[#ececec] bg-white px-5 py-[18px]' },
  templateUrl: './checkout-comprobante.html',
})
export class CheckoutComprobante {
  readonly tipo = model<TipoComprobante>('boleta');
  readonly ruc = model('');
  readonly razonSocial = model('');
  /** Al intentar pagar se muestran todos los errores, aunque el cliente no haya pasado por los campos. */
  readonly mostrarErrores = input(false);
  /** Motivo por el que el servidor no aceptó los datos de la factura. */
  readonly errorServidor = input<string | null>(null);
  /** Mientras se valida o se paga no se puede cambiar. */
  readonly bloqueado = input(false);

  protected readonly opciones = OPCIONES;
  protected readonly maxRazonSocial = RAZON_SOCIAL_MAXIMA;
  protected readonly esFactura = computed(() => this.tipo() === 'factura');
  private readonly tocados = signal({ ruc: false, razonSocial: false });

  private readonly errores = computed(() =>
    erroresDeComprobante(this.tipo(), this.ruc(), this.razonSocial()),
  );
  protected readonly errorRuc = computed(() =>
    this.mostrarErrores() || this.tocados().ruc ? this.errores().ruc : null,
  );
  protected readonly errorRazonSocial = computed(() =>
    this.mostrarErrores() || this.tocados().razonSocial ? this.errores().razonSocial : null,
  );

  protected elegir(tipo: TipoComprobante): void {
    if (this.bloqueado()) return;
    this.tipo.set(tipo);
  }

  /** Solo dígitos y como máximo 11, como en el prototipo. */
  protected escribirRuc(input: HTMLInputElement): void {
    const limpio = input.value.replace(/\D/g, '').slice(0, 11);
    if (input.value !== limpio) input.value = limpio;
    this.ruc.set(limpio);
  }

  protected escribirRazonSocial(valor: string): void {
    this.razonSocial.set(valor);
  }

  protected tocar(campo: 'ruc' | 'razonSocial'): void {
    this.tocados.update((t) => ({ ...t, [campo]: true }));
  }
}
