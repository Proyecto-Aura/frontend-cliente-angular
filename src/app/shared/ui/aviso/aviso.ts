import { Component, Injectable, inject, signal } from '@angular/core';

import { Icon } from '../icon/icon';

export interface AvisoVisible {
  titulo: string;
  detalle?: string;
}

/** Duración del aviso en pantalla. */
export const DURACION_AVISO_MS = 3500;

/** Aviso breve de confirmación ("Chifles salados agregado"), como en el prototipo. */
@Injectable({ providedIn: 'root' })
export class Avisos {
  readonly actual = signal<AvisoVisible | null>(null);
  private espera: ReturnType<typeof setTimeout> | undefined;

  mostrar(titulo: string, detalle?: string): void {
    clearTimeout(this.espera);
    this.actual.set({ titulo, detalle });
    this.espera = setTimeout(() => this.actual.set(null), DURACION_AVISO_MS);
  }
}

@Component({
  selector: 'app-aviso',
  imports: [Icon],
  templateUrl: './aviso.html',
})
export class Aviso {
  protected readonly avisos = inject(Avisos);
}
