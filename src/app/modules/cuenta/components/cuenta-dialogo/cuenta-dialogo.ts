import { DOCUMENT } from '@angular/common';
import { Directive, DestroyRef, ElementRef, afterNextRender, inject, output } from '@angular/core';

@Directive({
  selector: 'dialog[appCuentaDialogo]',
  exportAs: 'cuentaDialogo',
  host: {
    '(cancel)': 'cerrar($event)',
    '(keydown)': 'mantenerFoco($event)',
    '(click)': 'cerrarAlClicFuera($event)',
  },
})
export class CuentaDialogo {
  readonly cerrarSolicitado = output<void>();
  private readonly documento = inject(DOCUMENT);
  private readonly elemento = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  private origen: HTMLElement | null = null;
  private overflowAnterior: string | null = null;

  constructor() {
    afterNextRender(() => {
      this.origen = this.documento.activeElement as HTMLElement | null;
      this.overflowAnterior = this.documento.body.style.overflow;
      this.documento.body.style.overflow = 'hidden';
      this.elemento.nativeElement.showModal();
      const foco =
        this.elemento.nativeElement.querySelector<HTMLElement>(
          '[data-foco-inicial]:not(:disabled)',
        ) ?? this.elemento.nativeElement.querySelector<HTMLElement>('button:not(:disabled)');
      foco?.focus({ preventScroll: true });
    });
    inject(DestroyRef).onDestroy(() => this.restaurarFoco());
  }

  cerrar(event?: Event): void {
    event?.preventDefault();
    this.restaurarFoco();
    this.cerrarSolicitado.emit();
  }

  protected mantenerFoco(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab') return;
    const elementos = Array.from(
      this.elemento.nativeElement.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea',
      ),
    ).filter((e) => !e.matches(':disabled, [hidden], [type="hidden"]'));
    if (!elementos.length) return;
    const primero = elementos[0];
    const ultimo = elementos[elementos.length - 1];
    if (event.shiftKey && this.documento.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && this.documento.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  protected cerrarAlClicFuera(event: MouseEvent): void {
    const dialogo = this.elemento.nativeElement;
    if (event.target !== dialogo) return;
    const r = dialogo.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      this.cerrar();
  }

  private restaurarFoco(): void {
    if (this.elemento.nativeElement.open) this.elemento.nativeElement.close();
    if (this.overflowAnterior !== null) {
      this.documento.body.style.overflow = this.overflowAnterior;
      this.overflowAnterior = null;
    }
    if (this.origen?.isConnected) this.origen.focus({ preventScroll: true });
    this.origen = null;
  }
}
