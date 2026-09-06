import { Injectable, computed, signal } from '@angular/core';

import { RegistroDocumento, TipoRegistro } from '../models/registro.model';

/**
 * Estado compartido entre los pasos del registro. Se provee a nivel de la ruta
 * `auth/registro`, así que se crea al entrar al flujo y se destruye al salir.
 */
@Injectable()
export class AuthRegistroStore {
  private readonly _doc = signal<RegistroDocumento | null>(null);

  readonly doc = this._doc.asReadonly();

  /** `true` cuando el paso 1 está completo (habilita el paso 2). */
  readonly documentoListo = computed(() => this._doc() !== null);

  /** Elección de la UI en el paso 1 (persona / empresa). */
  readonly tipo = computed<TipoRegistro>(() => this._doc()?.tipo ?? 'persona');

  setDocumento(data: RegistroDocumento): void {
    this._doc.set(data);
  }

  reset(): void {
    this._doc.set(null);
  }
}
