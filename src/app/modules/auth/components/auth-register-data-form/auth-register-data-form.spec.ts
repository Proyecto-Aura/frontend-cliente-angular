import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RegisterClientePayload, RegistroDocumento } from '../../models/registro.model';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { authDom } from '../../testing/auth-dom';
import { hoyISO } from '../../utils/fechas';
import { AuthRegisterDataForm } from './auth-register-data-form';

describe('AuthRegisterDataForm', () => {
  let fixture: ComponentFixture<AuthRegisterDataForm>;
  let dom: ReturnType<typeof authDom<AuthRegisterDataForm>>;
  let enviados: RegisterClientePayload[];

  const montar = (doc: RegistroDocumento) => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), AuthRegistroStore] });
    TestBed.inject(AuthRegistroStore).setDocumento(doc);
    fixture = TestBed.createComponent(AuthRegisterDataForm);
    enviados = [];
    fixture.componentInstance.submitted.subscribe((p) => enviados.push(p));
    fixture.detectChanges();
    dom = authDom(fixture);
  };

  const datosDeUsuario = (password = 'clave123') => {
    dom.escribir('Email de acceso', 'ana@francos.test');
    dom.escribir('Username', 'anatorres');
    dom.escribir('Contraseña', password);
  };

  describe('persona natural (DNI, CE, pasaporte o RUC 10)', () => {
    beforeEach(() =>
      montar({ tipoDocumento: 'dni', tipoCliente: 'persona_natural', numeroDocumento: '12345678' }),
    );

    it('asks for the personal data and then the user data (RF-B06)', () => {
      expect(dom.texto()).toContain('Datos Personales');
      dom.escribir('Nombres', 'Ana');
      dom.escribir('Apellido paterno', 'Torres');
      dom.escribir('Apellido materno', 'Vega');
      dom.escribir('Teléfono', '987654321');
      dom.escribir('Fecha de nacimiento', '1998-05-12');
      dom.escribir('Dirección', 'Av. Los Girasoles 123');
      dom.clic('Continuar');

      expect(dom.texto()).toContain('Datos de Usuario');
      datosDeUsuario();
      dom.clic('Crear cuenta');

      expect(enviados).toEqual([
        expect.objectContaining({
          tipo_documento: 'dni',
          numero_documento: '12345678',
          tipo_cliente: 'persona_natural',
          nombres: 'Ana',
          telefono: '987654321',
          direccion: 'Av. Los Girasoles 123',
          email: 'ana@francos.test',
          username: 'anatorres',
        }),
      ]);
    });

    it('shows a message for each empty field (RF-B09)', () => {
      dom.escribir('Nombres', '');
      dom.escribir('Teléfono', '12');

      expect(dom.texto()).toContain('Ingresa los nombres.');
      expect(dom.texto()).toContain('Ingresa un teléfono válido (6 a 9 dígitos).');
      expect(dom.boton('Continuar')?.disabled).toBe(true);
    });

    it('does not let the calendar pick a day after today', () => {
      expect(dom.campo('Fecha de nacimiento').getAttribute('max')).toBe(hoyISO());
    });

    it('rejects a future birth date typed by hand', () => {
      dom.escribir('Fecha de nacimiento', '2999-01-01');

      expect(dom.texto()).toContain('La fecha de nacimiento no puede ser futura.');
      expect(dom.boton('Continuar')?.disabled).toBe(true);
    });

    it('asks for the birth date when it is empty', () => {
      dom.escribir('Fecha de nacimiento', '');

      expect(dom.texto()).toContain('Ingresa tu fecha de nacimiento.');
    });
  });

  describe('empresa (RUC 20)', () => {
    beforeEach(() =>
      montar({ tipoDocumento: 'ruc', tipoCliente: 'empresa', numeroDocumento: '20456789012' }),
    );

    it('asks for the company data (business name, phone, address) and the contact', () => {
      expect(dom.texto()).toContain('Datos de Empresa');
      expect(dom.texto()).toContain('Datos del Contacto');
      dom.escribir('Razón Social', 'Distribuidora El Sol S.A.C.');
      dom.escribir('Teléfono', '987654321');
      dom.escribir('Dirección', 'Av. Grau 1450, Piura');
      dom.escribir('Nombres', 'Ana');
      dom.escribir('Apellido paterno', 'Torres');
      dom.escribir('Apellido materno', 'Vega');
      dom.escribir('Fecha de nacimiento', '1998-05-12');
      dom.clic('Continuar');
      datosDeUsuario();
      dom.clic('Crear cuenta');

      expect(enviados).toEqual([
        expect.objectContaining({
          tipo_cliente: 'empresa',
          razon_social: 'Distribuidora El Sol S.A.C.',
          telefono: '987654321',
          direccion: 'Av. Grau 1450, Piura',
          nombres: 'Ana',
        }),
      ]);
    });
  });

  describe('password', () => {
    beforeEach(() => {
      montar({ tipoDocumento: 'dni', tipoCliente: 'persona_natural', numeroDocumento: '12345678' });
      dom.escribir('Nombres', 'Ana');
      dom.escribir('Apellido paterno', 'Torres');
      dom.escribir('Apellido materno', 'Vega');
      dom.escribir('Teléfono', '987654321');
      dom.escribir('Fecha de nacimiento', '1998-05-12');
      dom.escribir('Dirección', 'Av. Los Girasoles 123');
      dom.clic('Continuar');
    });

    it('only requires 8 characters: a weak password can still create the account', () => {
      datosDeUsuario('abcdefgh');

      expect(dom.texto()).toContain('Muy débil');
      expect(dom.boton('Crear cuenta')?.disabled).toBe(false);
    });

    it('blocks a password shorter than 8 characters', () => {
      datosDeUsuario('Ab1!');

      expect(dom.texto()).toContain('La contraseña debe tener al menos 8 caracteres.');
      expect(dom.boton('Crear cuenta')?.disabled).toBe(true);
    });

    it('shows and hides the password with the eye icon (RF-B07)', () => {
      const ojo = dom.raiz().querySelector<HTMLButtonElement>('[aria-label="Mostrar contraseña"]')!;
      ojo.click();
      fixture.detectChanges();

      expect((dom.campo('Contraseña') as HTMLInputElement).type).toBe('text');
    });
  });
});
