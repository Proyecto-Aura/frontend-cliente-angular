import { Component, inject } from '@angular/core';

import { ToastService } from './toast-service';

/** Pila de toasts, abajo a la derecha. Se monta una sola vez en app.ts. */
@Component({
  selector: 'app-toaster',
  host: { class: 'pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2' },
  templateUrl: './toaster.html',
})
export class Toaster {
  protected readonly toast = inject(ToastService);
}
