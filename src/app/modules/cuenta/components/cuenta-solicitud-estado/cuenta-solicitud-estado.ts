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
      class="inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-[10px] px-[9px] text-[10.5px] font-bold"
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
