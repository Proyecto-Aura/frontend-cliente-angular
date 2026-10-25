import { Component, input, output } from '@angular/core';

import { Icon } from '../icon/icon';

/** Selector de cantidad −/+ del prototipo (agregar al carrito y el carrito). */
@Component({
  selector: 'app-cantidad-stepper',
  imports: [Icon],
  host: { class: 'flex items-center gap-0.5 rounded-md', role: 'group', 'aria-label': 'Cantidad' },
  templateUrl: './cantidad-stepper.html',
})
export class CantidadStepper {
  readonly cantidad = input.required<number>();
  readonly maximo = input(99);
  /** `sm`: el del carrito; `md`: el de agregar al carrito. */
  readonly tamano = input<'sm' | 'md'>('md');

  readonly cambiar = output<number>();
}
