import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { PerfilCliente } from '../../models/perfil.model';
import { PerfilStore } from '../../services/perfil-store';
import { CuentaPerfil } from './cuenta-perfil';

describe('CuentaPerfil (HU-B-015 RF-B43, HU-B-016 RF-B44)', () => {
  const PERFIL_URL = `${environment.apiUrl}/perfil`;
  const PERFIL: PerfilCliente = {
    nombres: 'Rosa Elena',
    apellido_paterno: 'Quispe',
    apellido_materno: 'Huamán',
    email: 'rosa@francos.test',
    telefono: '987654321',
    tipo_documento: 'dni',
    numero_documento: '45678912',
    tipo_cliente: 'persona_natural',
    razon_social: null,
  };

  let fixture: ComponentFixture<CuentaPerfil>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const campo = (id: string) => raiz().querySelector<HTMLInputElement>(`#${id}`)!;
  const escribir = (id: string, valor: string) => {
    campo(id).value = valor;
    campo(id).dispatchEvent(new Event('input'));
    campo(id).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const boton = (texto: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(texto),
    );
  const guardar = () => {
    boton('Guardar Cambios')!.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CuentaPerfil);
    fixture.detectChanges();
    httpMock.expectOne(PERFIL_URL).flush(PERFIL);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('loads the name, email and phone of the client', () => {
    expect(campo('pf-nombre').value).toBe('Rosa Elena');
    expect(campo('pf-correo').value).toBe('rosa@francos.test');
    expect(campo('pf-telefono').value).toBe('987654321');
    // Sin cambios no se guarda ni hay "Descartar".
    expect(boton('Descartar')).toBeUndefined();
    guardar();
    httpMock.expectNone(PERFIL_URL);
  });

  it('offers changing the password below the personal data (HU-B-017)', () => {
    expect(raiz().querySelector('app-cuenta-password-card')).not.toBeNull();
    expect(campo('pw-actual')).not.toBeNull();
  });

  it('saves only what changed and confirms it', () => {
    escribir('pf-nombre', ' Rosa María ');
    escribir('pf-telefono', '912345678');
    guardar();

    const req = httpMock.expectOne(PERFIL_URL);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ nombres: 'Rosa María', telefono: '912345678' });
    req.flush({ ...PERFIL, nombres: 'Rosa María', telefono: '912345678' });
    fixture.detectChanges();

    expect(TestBed.inject(PerfilStore).nombreVisible()).toBe('Rosa María Quispe');
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Tus datos personales se guardaron.',
    );
    expect(boton('Descartar')).toBeUndefined();
  });

  it('does not change the email until it is confirmed from the link (HU-B-016)', () => {
    escribir('pf-correo', 'Rosa.Nueva@francos.test');
    guardar();

    const req = httpMock.expectOne(PERFIL_URL);
    expect(req.request.body).toEqual({ email: 'Rosa.Nueva@francos.test' });
    // El backend no aplica el correo nuevo: devuelve el actual y avisa que quedó pendiente.
    req.flush({ ...PERFIL, cambio_email_pendiente: true });
    fixture.detectChanges();

    const aviso = raiz().querySelector('[role="status"]')!.textContent!.replace(/\s+/g, ' ');
    expect(aviso).toContain('Te enviamos un enlace a rosa.nueva@francos.test');
    expect(aviso).toContain('Tu correo actual sigue activo hasta que lo confirmes');
    expect(raiz().textContent).not.toContain('Tus datos personales se guardaron.');
    expect(campo('pf-correo').value).toBe('rosa@francos.test');
    expect(TestBed.inject(PerfilStore).perfil()).toEqual(PERFIL);
  });

  it('saves the name and leaves the new email pending in the same request', () => {
    escribir('pf-nombre', 'Rosa María');
    escribir('pf-correo', 'rosa.nueva@francos.test');
    guardar();

    httpMock
      .expectOne(PERFIL_URL)
      .flush({ ...PERFIL, nombres: 'Rosa María', cambio_email_pendiente: true });
    fixture.detectChanges();

    const avisos = [...raiz().querySelectorAll('[role="status"]')].map((e) => e.textContent!);
    expect(avisos.some((t) => t.includes('Tus datos personales se guardaron.'))).toBe(true);
    expect(avisos.some((t) => t.includes('Te enviamos un enlace'))).toBe(true);
  });

  it('does not announce a pending email when only the name changed', () => {
    escribir('pf-nombre', 'Rosa María');
    guardar();

    httpMock
      .expectOne(PERFIL_URL)
      .flush({ ...PERFIL, nombres: 'Rosa María', cambio_email_pendiente: false });
    fixture.detectChanges();

    expect(raiz().textContent).not.toContain('Te enviamos un enlace');
  });

  it.each([
    ['pf-nombre', '', 'Ingresa tu nombre'],
    ['pf-correo', 'no-es-correo', 'Ingresa un correo electrónico válido'],
    ['pf-telefono', '98765', 'El teléfono debe tener 9 dígitos'],
    ['pf-telefono', '', 'Ingresa'],
  ])('validates %s = "%s" before sending', (id, valor, mensaje) => {
    escribir(id, valor);
    guardar();

    httpMock.expectNone(PERFIL_URL);
    expect(raiz().textContent).toContain(mensaje);
  });

  it('shows under the email when another account uses it (409)', () => {
    escribir('pf-correo', 'otro@francos.test');
    guardar();

    httpMock
      .expectOne(PERFIL_URL)
      .flush(
        { message: 'Ese correo ya está registrado en otra cuenta' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(raiz().textContent).toContain('Ese correo ya está registrado en otra cuenta');
    expect(campo('pf-correo').getAttribute('aria-invalid')).toBe('true');
  });

  it('discards the changes', () => {
    escribir('pf-nombre', 'Otro nombre');

    boton('Descartar')!.click();
    fixture.detectChanges();

    expect(campo('pf-nombre').value).toBe('Rosa Elena');
    expect(boton('Descartar')).toBeUndefined();
  });
});
