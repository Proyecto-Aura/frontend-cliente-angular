import { Component, ElementRef, afterNextRender, computed, input, output, viewChild } from '@angular/core';

let seq = 0;

const WIDTHS = { sm: 420, md: 480, lg: 560 } as const;

/**
 * Modal del DS: fondo oscurecido, panel blanco de radio 8px, cabecera roja con título
 * blanco (y `description` opcional), cuerpo con padding de 24px y pie con borde superior.
 * El padre lo muestra con `@if` y lo oculta en `(closed)`. Cierra con Escape, con ✕ o
 * con clic en el fondo, y al abrirse mueve el foco al panel.
 *
 * ```html
 * <app-ui-modal title="Nueva dirección" description="Se usará en tus envíos" (closed)="abierto.set(false)">
 *   …contenido…
 *   <ng-container slot="footer">…botones…</ng-container>
 * </app-ui-modal>
 * ```
 * Un icono en la cabecera va con `slot="icon"`; un texto de ayuda en el pie con `hint`.
 */
@Component({
  selector: 'app-ui-modal',
  host: {
    class: 'fixed inset-0 z-50 flex items-center justify-center p-6',
    '(document:keydown.escape)': 'closed.emit()',
  },
  templateUrl: './ui-modal.html',
})
export class UiModal {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly hint = input<string | null>(null);
  /** Ancho máximo: sm 420 · md 480 (por defecto) · lg 560. */
  readonly size = input<keyof typeof WIDTHS>('md');

  readonly closed = output<void>();

  protected readonly titleId = `ui-modal-title-${++seq}`;
  protected readonly maxWidth = computed(() => WIDTHS[this.size()]);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    afterNextRender(() => this.panel().nativeElement.focus());
  }
}
