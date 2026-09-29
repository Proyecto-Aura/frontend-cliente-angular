import { Component, computed, input, model } from '@angular/core';

/** Selector de cantidad −/+. Uso: `<app-ui-quantity [(value)]="cantidad" [max]="stock" />`. */
@Component({
  selector: 'app-ui-quantity',
  host: { class: 'inline-flex' },
  templateUrl: './ui-quantity.html',
})
export class UiQuantity {
  readonly value = model(1);
  readonly min = input(1);
  readonly max = input(99);
  /** Texto para lectores de pantalla (ej. "Cantidad de Papas clásicas"). */
  readonly label = input('Cantidad');

  protected readonly canDecrease = computed(() => this.value() > this.min());
  protected readonly canIncrease = computed(() => this.value() < this.max());

  protected decrease(): void {
    if (this.canDecrease()) this.value.update((v) => v - 1);
  }
  protected increase(): void {
    if (this.canIncrease()) this.value.update((v) => v + 1);
  }
}
