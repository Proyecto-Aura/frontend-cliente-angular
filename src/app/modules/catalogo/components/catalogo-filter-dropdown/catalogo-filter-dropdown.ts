import { Component, computed, input, model, signal } from '@angular/core';

/**
 * Selector desplegable de filtro. La primera opción se trata como "sin filtro":
 * si el valor es esa, el botón muestra `label`; si no, muestra el valor elegido
 * y se resalta en rojo. `value` es two-way (`[(value)]`).
 */
@Component({
  selector: 'app-catalogo-filter-dropdown',
  host: { class: 'relative block' },
  template: `
    <button
      type="button"
      (click)="open.set(!open())"
      [class.border-brand-600]="activo()"
      [class.text-brand-600]="activo()"
      [class.bg-brand-50]="activo()"
      [class.border-line-soft]="!activo()"
      [class.text-ink-soft]="!activo()"
      [class.bg-surface]="!activo()"
      class="flex h-[36px] cursor-pointer items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all hover:border-line"
    >
      {{ activo() ? value() : label() }}
      <svg
        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        class="transition-transform duration-200"
        [class.rotate-180]="open()"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    @if (open()) {
      <div
        class="absolute left-0 top-[40px] z-20 min-w-[160px] overflow-hidden rounded-xl border border-line-soft bg-surface shadow-[0px_8px_24px_rgba(0,0,0,0.1)]"
      >
        @for (opt of options(); track opt) {
          <button
            type="button"
            (click)="pick(opt)"
            [class.text-brand-600]="value() === opt"
            [class.font-semibold]="value() === opt"
            [class.text-label]="value() !== opt"
            class="w-full cursor-pointer px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-brand-50"
          >
            {{ opt }}
          </button>
        }
      </div>
    }
  `,
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
