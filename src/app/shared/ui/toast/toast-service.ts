import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

/**
 * Cola de notificaciones tipo "toast" (equivale a sonner en el portal React).
 * Los componentes llaman a `show()`/`success()`/`warning()`… y `<app-toaster>`
 * (montado en app.ts) las pinta. Auto-descartan a los 4 s.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  show(type: ToastType, title: string, description?: string): void {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, type, title, description }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(title: string, description?: string): void {
    this.show('success', title, description);
  }
  warning(title: string, description?: string): void {
    this.show('warning', title, description);
  }
  error(title: string, description?: string): void {
    this.show('error', title, description);
  }
  info(title: string, description?: string): void {
    this.show('info', title, description);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
