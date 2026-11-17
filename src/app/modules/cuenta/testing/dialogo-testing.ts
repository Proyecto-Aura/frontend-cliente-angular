import { afterAll, beforeAll } from 'vitest';

/** Solo JSDOM. El aislamiento nativo se comprueba también en Chromium visible. */
export function prepararDialogoEnPruebas(): void {
  const originales = new Map<string, PropertyDescriptor | undefined>();
  beforeAll(() => {
    for (const [nombre, abrir] of [
      ['showModal', true],
      ['close', false],
    ] as const) {
      originales.set(nombre, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, nombre));
      Object.defineProperty(HTMLDialogElement.prototype, nombre, {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.open = abrir;
        },
      });
    }
  });
  afterAll(() => {
    for (const [nombre, descriptor] of originales) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, nombre, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, nombre);
    }
  });
}
