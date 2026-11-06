import { CuentaDialogo } from './cuenta-dialogo';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';

@Component({
  imports: [CuentaDialogo],
  template: `<dialog
    appCuentaDialogo
    #modal="cuentaDialogo"
    (cerrarSolicitado)="cierres.update((n) => n + 1)"
  >
    <button id="cerrar-arriba" (click)="modal.cerrar()">Cerrar</button>
    <select data-foco-inicial>
      <option>Pedido</option></select
    ><input /><textarea></textarea>
    <fieldset disabled><button id="deshabilitado">No disponible</button></fieldset>
    <button id="cerrar-abajo" (click)="modal.cerrar()">Cancelar</button>
  </dialog>`,
})
class DialogoPrueba {
  readonly cierres = signal(0);
}

describe('CuentaDialogo', () => {
  prepararDialogoEnPruebas();
  let fixture: ComponentFixture<DialogoPrueba>;
  let origen: HTMLButtonElement;
  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [DialogoPrueba] });
    origen = document.createElement('button');
    document.body.append(origen);
    origen.focus();
    fixture = TestBed.createComponent(DialogoPrueba);
    await fixture.whenStable();
  });
  afterEach(() => {
    fixture.destroy();
    origen.remove();
  });

  it('focuses the designated form control and restores its origin on cancel', () => {
    const dialogo = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    expect(document.activeElement).toBe(dialogo.querySelector('select'));
    dialogo.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(dialogo.open).toBe(false);
    expect(document.activeElement).toBe(origen);
    expect(fixture.componentInstance.cierres()).toBe(1);
  });

  it('cycles keyboard focus around all enabled controls', () => {
    const raiz = fixture.nativeElement as HTMLElement;
    const primero = raiz.querySelector<HTMLButtonElement>('#cerrar-arriba')!;
    const ultimo = raiz.querySelector<HTMLButtonElement>('#cerrar-abajo')!;
    primero.focus();
    primero.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(ultimo);
    ultimo.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(primero);
  });

  it('does not close when interacting with fields inside the dialog', () => {
    (fixture.nativeElement as HTMLElement).querySelector('input')!.click();
    expect(fixture.componentInstance.cierres()).toBe(0);
  });
});
