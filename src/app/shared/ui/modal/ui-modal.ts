import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

let seq = 0;

/**
 * Modal con overlay, título y botón de cerrar. El padre lo muestra con `@if` y
 * lo oculta en `(closed)`. Cierra con Escape o clic en el fondo, y al abrirse
 * mueve el foco al panel. Los botones de acción van con `slot="footer"`:
 *
 * ```html
 * <app-ui-modal title="Nueva dirección" (closed)="abierto.set(false)">
 *   …contenido…
 *   <div slot="footer">…botones…</div>
 * </app-ui-modal>
 * ```
 */
@Component({
  selector: 'app-ui-modal',
  host: {
    class: 'animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4',
    '(document:keydown.escape)': 'closed.emit()',
  },
  templateUrl: './ui-modal.html',
})
export class UiModal {
  readonly title = input.required<string>();
  readonly size = input<'sm' | 'md'>('md');

  readonly closed = output<void>();

  protected readonly titleId = `ui-modal-title-${++seq}`;
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    afterNextRender(() => this.panel().nativeElement.focus());
  }
}
