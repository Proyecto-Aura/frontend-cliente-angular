import { Injectable, computed, signal } from '@angular/core';

import { RegistroDocumento, TipoRegistro } from '../models/registro.model';

/**
 * Estado compartido entre los pasos del registro. Se provee a nivel de la ruta
 * `auth/registro`, así que se crea al entrar al flujo y se destruye al salir.
 */
@Injectable()
export class AuthRegistroStore {
  private readonly _tipo = signal<TipoRegistro | null>(null);
  private readonly _documento = signal('');

  readonly tipo = this._tipo.asReadonly();
  readonly documento = this._documento.asReadonly();

  /** `true` cuando el paso 1 está completo (habilita el paso 2). */
  readonly documentoListo = computed(
    () => this._tipo() !== null && this._documento().length > 0,
  );

  setDocumento(data: RegistroDocumento): void {
    this._tipo.set(data.tipo);
    this._documento.set(data.documento);
  }

  reset(): void {
    this._tipo.set(null);
    this._documento.set('');
  }
}
