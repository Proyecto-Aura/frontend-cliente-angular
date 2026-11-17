import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { PerfilCliente } from '../../../cuenta/models/perfil.model';

/**
 * "Datos del cliente" del checkout: nombre y teléfono tomados del perfil, solo
 * para que el cliente los corrobore. Se editan en Mi perfil (HU-B-015).
 */
@Component({
  selector: 'app-checkout-cliente',
  imports: [Icon, RouterLink],
  host: { class: 'block rounded-xl border border-[#ececec] bg-white px-5 py-[18px]' },
  templateUrl: './checkout-cliente.html',
})
export class CheckoutCliente {
  /** `null` mientras el perfil carga o si no se pudo traer. */
  readonly perfil = input<PerfilCliente | null>(null);

  protected readonly nombre = computed(() => {
    const p = this.perfil();
    return p ? [p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') : '';
  });
  protected readonly telefono = computed(() => this.perfil()?.telefono ?? '');
}
