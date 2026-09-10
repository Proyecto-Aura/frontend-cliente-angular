import { Component, computed, input, model, signal } from '@angular/core';

/**
 * Selector desplegable de filtro. La primera opción se trata como "sin filtro":
 * si el valor es esa, el botón muestra `label`; si no, muestra el valor elegido
 * y se resalta en rojo. `value` es two-way (`[(value)]`).
 */
@Component({
  selector: 'app-catalogo-filter-dropdown',
  host: { class: 'relative block' },
  templateUrl: './catalogo-filter-dropdown.html',
})
export class CatalogoFilterDropdown {
  readonly label = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly value = model.required<string>();

  protected readonly open = signal(false);
  protected readonly activo = computed(() => this.value() !== this.options()[0]);

  protected pick(opt: string): void {
    this.value.set(opt);
    this.open.set(false);
  }
}
