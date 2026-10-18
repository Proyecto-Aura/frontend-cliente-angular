import { ComponentFixture } from '@angular/core/testing';

/** Ayudas de los specs del módulo auth para manejar el formulario como el usuario. */
export function authDom<T>(fixture: ComponentFixture<T>) {
  const raiz = () => fixture.nativeElement as HTMLElement;

  // Los campos de auth-input van dentro de su <label>; se buscan por su texto.
  const campo = (etiqueta: string) => {
    const label = Array.from(raiz().querySelectorAll('label')).find(
      (l) => l.querySelector('span')?.textContent?.trim() === etiqueta,
    );
    const control = label?.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
    if (!control) throw new Error(`No hay un campo "${etiqueta}"`);
    return control;
  };

  const escribir = (etiqueta: string, valor: string) => {
    const control = campo(etiqueta);
    control.value = valor;
    control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
    control.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };

  const boton = (texto: string) =>
    Array.from(raiz().querySelectorAll('button')).find((b) => b.textContent?.trim() === texto);

  const clic = (texto: string) => {
    const b = boton(texto);
    if (!b) throw new Error(`No hay un botón "${texto}"`);
    b.click();
    fixture.detectChanges();
  };

  return { raiz, campo, escribir, boton, clic, texto: () => raiz().textContent ?? '' };
}
