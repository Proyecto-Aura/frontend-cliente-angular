import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AuthRegistroStore } from '../../services/auth-registro-store';
import { authDom } from '../../testing/auth-dom';
import { AuthRegisterDocForm } from './auth-register-doc-form';

describe('AuthRegisterDocForm', () => {
  let fixture: ComponentFixture<AuthRegisterDocForm>;
  let store: AuthRegistroStore;
  let dom: ReturnType<typeof authDom<AuthRegisterDocForm>>;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), AuthRegistroStore] });
    store = TestBed.inject(AuthRegistroStore);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(AuthRegisterDocForm);
    fixture.detectChanges();
    dom = authDom(fixture);
  });

  const elegir = (tipo: string, numero: string) => {
    dom.escribir('Tipo de documento', tipo);
    dom.escribir('Número de documento', numero);
  };

  it.each([
    ['dni', '12345678', 'persona_natural'],
    ['ce', '001234567', 'persona_natural'],
    ['pasaporte', 'AB123456', 'persona_natural'],
    ['ruc', '10456789012', 'persona_natural'],
    ['ruc', '20456789012', 'empresa'],
  ])('a %s %s le pide los datos de %s (RF-B06)', (tipo, numero, tipoCliente) => {
    elegir(tipo, numero);
    dom.clic('Siguiente');

    expect(store.doc()).toEqual({
      tipoDocumento: tipo,
      tipoCliente,
      numeroDocumento: numero,
    });
    expect(navegar).toHaveBeenCalledWith(['/auth/registro/datos']);
  });

  it('rejects a RUC that does not start with 10 or 20 (RF-B09)', () => {
    elegir('ruc', '15456789012');

    expect(dom.boton('Siguiente')?.disabled).toBe(true);
    expect(dom.texto()).toContain('El número no tiene un formato válido');
  });

  it('rejects a DNI that is not 8 digits', () => {
    elegir('dni', '1234567');

    expect(dom.boton('Siguiente')?.disabled).toBe(true);
    expect(store.doc()).toBeNull();
  });
});
