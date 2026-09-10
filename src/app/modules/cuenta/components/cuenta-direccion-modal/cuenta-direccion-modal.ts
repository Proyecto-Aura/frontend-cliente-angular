import { Component, computed, input, linkedSignal, output } from '@angular/core';

import { DISTRITOS } from '../../../../shared/utils/constants';
import { Direccion } from '../../models/direccion.model';

type DireccionData = Pick<Direccion, 'nombre' | 'linea1' | 'linea2'>;

/** Modal para crear o editar una dirección de entrega. */
@Component({
  selector: 'app-cuenta-direccion-modal',
  host: { class: 'block' },
  templateUrl: './cuenta-direccion-modal.html',
})
export class CuentaDireccionModal {
  readonly initial = input<Direccion | null>(null);
  readonly close = output<void>();
  readonly save = output<DireccionData>();

  protected readonly distritos = DISTRITOS;

  protected readonly nombre = linkedSignal(() => this.initial()?.nombre ?? '');
  protected readonly linea1 = linkedSignal(() => this.initial()?.linea1 ?? '');
  protected readonly distrito = linkedSignal(
    () => this.initial()?.linea2?.split(',')[0]?.trim() ?? '',
  );

  protected readonly valido = computed(
    () => this.nombre().trim() !== '' && this.linea1().trim() !== '' && this.distrito() !== '',
  );

  protected guardar(): void {
    if (!this.valido()) return;
    this.save.emit({
      nombre: this.nombre().trim(),
      linea1: this.linea1().trim(),
      linea2: `${this.distrito()}, Lima, Perú`,
    });
  }
}
