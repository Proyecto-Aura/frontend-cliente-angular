import { Component, computed, input } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';
import { EstadoSolicitud } from '../../models/solicitud-vista.model';
import { SOLICITUD_ESTADOS } from './solicitud-estados';

@Component({
  imports: [Icon],
  selector: 'app-cuenta-solicitud-estado',
  host: { class: 'inline-flex' },
  template: `
    <span
      class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] leading-tight font-semibold"
      [class]="visual().tono"
    >
      <app-icon [name]="visual().icono" [size]="11" />{{ visual().etiqueta }}
    </span>
  `,
})
export class CuentaSolicitudEstado {
  readonly estado = input.required<EstadoSolicitud>();
  protected readonly visual = computed(() => SOLICITUD_ESTADOS[this.estado()]);
}
