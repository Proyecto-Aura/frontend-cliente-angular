import { Component, computed, input, output } from '@angular/core';

import { Icon } from '../../../../shared/ui/icon/icon';

export interface OpcionFiltro<T> {
  valor: T;
  label: string;
}

/**
 * Botón de filtro con su lista de opciones (prototipo del catálogo). Muestra
 * la opción elegida en lugar del nombre del filtro. Quien lo usa decide cuál
 * está abierto, para que solo haya uno a la vez.
 */
@Component({
  selector: 'app-catalogo-filter-dropdown',
  imports: [Icon],
  host: { class: 'relative block' },
  templateUrl: './catalogo-filter-dropdown.html',
})
export class CatalogoFilterDropdown<T> {
  readonly label = input.required<string>();
  /** Opción "sin filtro" que va primero: "Todas", "Relevancia"… */
  readonly labelTodos = input.required<string>();
  readonly opciones = input.required<OpcionFiltro<T>[]>();
  readonly seleccionado = input.required<T | null>();
  readonly abierto = input(false);

  readonly alternar = output<void>();
  readonly elegir = output<T | null>();

  /** La opción "sin filtro" (valor `null`) más las del filtro. */
  protected readonly todas = computed<OpcionFiltro<T | null>[]>(() => [
    { valor: null, label: this.labelTodos() },
    ...this.opciones(),
  ]);

  protected readonly elegida = computed(
    () => this.opciones().find((o) => o.valor === this.seleccionado())?.label ?? null,
  );
}
