import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { PerfilCliente, UbigeoItem } from '../../models/perfil.model';
import { PerfilStore } from '../../services/perfil-store';
import { CuentaDireccionCard } from './cuenta-direccion-card';

describe('CuentaDireccionCard (HU-B-018, RF-B46)', () => {
  const PERFIL_URL = `${environment.apiUrl}/perfil`;
  const UBIGEO_URL = `${environment.apiUrl}/ubigeo`;
  const DEPARTAMENTOS: UbigeoItem[] = [
    { id: '15', nombre: 'Lima' },
    { id: '04', nombre: 'Arequipa' },
  ];
  const PROVINCIAS_LIMA: UbigeoItem[] = [{ id: '1501', nombre: 'Lima' }];
  const DISTRITOS_LIMA: UbigeoItem[] = [
    { id: '150131', nombre: 'San Isidro' },
    { id: '150122', nombre: 'Miraflores' },
  ];
  const PERFIL: PerfilCliente = {
    nombres: 'Rosa Elena',
    apellido_paterno: 'Quispe',
    apellido_materno: 'Huamán',
    email: 'rosa@francos.test',
    telefono: '987654321',
    direccion: 'Av. Los Girasoles 123',
    ubicacion: {
      departamento: { id: '15', nombre: 'Lima' },
      provincia: { id: '1501', nombre: 'Lima' },
      distrito: { id: '150131', nombre: 'San Isidro' },
    },
    tipo_documento: 'dni',
    numero_documento: '45678912',
    tipo_cliente: 'persona_natural',
    razon_social: null,
  };

  let fixture: ComponentFixture<CuentaDireccionCard>;
  let httpMock: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const input = (id: string) => raiz().querySelector<HTMLInputElement>(`#${id}`)!;
  const select = (id: string) => raiz().querySelector<HTMLSelectElement>(`#${id}`)!;
  const boton = (texto: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(texto),
    );
  const escribir = (id: string, valor: string) => {
    input(id).value = valor;
    input(id).dispatchEvent(new Event('input'));
    input(id).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const elegir = (id: string, valor: string) => {
    select(id).value = valor;
    select(id).dispatchEvent(new Event('change'));
    select(id).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const guardar = () => {
    boton('Guardar Dirección')!.click();
    fixture.detectChanges();
  };
  const listaDe = (ruta: string, param: string, valor: string) =>
    httpMock.expectOne((r) => r.url === `${UBIGEO_URL}/${ruta}` && r.params.get(param) === valor);

  /** Crea la tarjeta con el perfil ya cargado en el store y responde su catálogo. */
  const crear = (perfil: PerfilCliente) => {
    TestBed.inject(PerfilStore).cargar().subscribe();
    httpMock.expectOne(PERFIL_URL).flush(perfil);
    fixture = TestBed.createComponent(CuentaDireccionCard);
    fixture.detectChanges();
    httpMock.expectOne(`${UBIGEO_URL}/departamentos`).flush(DEPARTAMENTOS);
    if (perfil.ubicacion) {
      listaDe('provincias', 'departamento_id', '15').flush(PROVINCIAS_LIMA);
      listaDe('distritos', 'provincia_id', '1501').flush(DISTRITOS_LIMA);
    }
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the saved address with its department, province and district', () => {
    crear(PERFIL);

    expect(input('dir-direccion').value).toBe('Av. Los Girasoles 123');
    expect(select('dir-departamento').value).toBe('15');
    expect(select('dir-provincia').value).toBe('1501');
    expect(select('dir-distrito').value).toBe('150131');
    // Sin cambios no hay "Descartar" ni se envía nada.
    expect(boton('Descartar')).toBeUndefined();
    guardar();
    httpMock.expectNone(PERFIL_URL);
  });

  it('starts empty when the client has no address yet', () => {
    crear({ ...PERFIL, direccion: null, ubicacion: null });

    expect(input('dir-direccion').value).toBe('');
    expect(select('dir-departamento').value).toBe('');
    expect(select('dir-provincia').options.length).toBe(1);
  });

  it('empties and reloads the lower levels when the department changes', () => {
    crear(PERFIL);

    elegir('dir-departamento', '04');
    listaDe('provincias', 'departamento_id', '04').flush([{ id: '0401', nombre: 'Arequipa' }]);
    fixture.detectChanges();

    expect(select('dir-provincia').value).toBe('');
    expect(select('dir-distrito').value).toBe('');
    expect(select('dir-provincia').options.length).toBe(2);
    expect(select('dir-distrito').options.length).toBe(1);

    elegir('dir-provincia', '0401');
    listaDe('distritos', 'provincia_id', '0401').flush([{ id: '040101', nombre: 'Arequipa' }]);
    fixture.detectChanges();
    expect(select('dir-distrito').options.length).toBe(2);
  });

  it('saves only what changed and confirms it', () => {
    crear(PERFIL);

    escribir('dir-direccion', '  Jr. Lima 45, Dpto 301 ');
    elegir('dir-distrito', '150122');
    guardar();

    const req = httpMock.expectOne(PERFIL_URL);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      direccion: 'Jr. Lima 45, Dpto 301',
      distrito_id: '150122',
    });
    req.flush({
      ...PERFIL,
      direccion: 'Jr. Lima 45, Dpto 301',
      ubicacion: { ...PERFIL.ubicacion!, distrito: { id: '150122', nombre: 'Miraflores' } },
    });
    fixture.detectChanges();

    expect(TestBed.inject(PerfilStore).perfil()?.direccion).toBe('Jr. Lima 45, Dpto 301');
    const aviso = TestBed.inject(Avisos).actual();
    expect(aviso?.titulo).toBe('Tu dirección de entrega se guardó');
    expect(aviso?.tono).toBe('success');
    expect(boton('Descartar')).toBeUndefined();
  });

  it('sends only the address when the district did not change', () => {
    crear(PERFIL);

    escribir('dir-direccion', 'Calle Nueva 9');
    guardar();

    const req = httpMock.expectOne(PERFIL_URL);
    expect(req.request.body).toEqual({ direccion: 'Calle Nueva 9' });
    req.flush({ ...PERFIL, direccion: 'Calle Nueva 9' });
  });

  it('asks for every field when the client has no address', () => {
    crear({ ...PERFIL, direccion: null, ubicacion: null });

    guardar();

    httpMock.expectNone(PERFIL_URL);
    const texto = raiz().textContent;
    expect(texto).toContain('Ingresa tu dirección de entrega');
    expect(texto).toContain('Selecciona tu departamento');
    expect(texto).toContain('Selecciona tu provincia');
    expect(texto).toContain('Selecciona tu distrito');
  });

  it('rejects a blank or too long address before sending', () => {
    crear(PERFIL);

    escribir('dir-direccion', '   ');
    guardar();
    expect(raiz().textContent).toContain('Ingresa tu dirección de entrega');

    escribir('dir-direccion', 'a'.repeat(256));
    guardar();
    expect(raiz().textContent).toContain('La dirección no puede pasar de 255 caracteres');
    httpMock.expectNone(PERFIL_URL);
  });

  it('shows the message of the backend when saving fails (400)', () => {
    crear(PERFIL);

    escribir('dir-direccion', 'Calle Nueva 9');
    guardar();
    httpMock
      .expectOne(PERFIL_URL)
      .flush({ message: 'El distrito no existe' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    const aviso = TestBed.inject(Avisos).actual();
    expect(aviso?.titulo).toBe('El distrito no existe');
    expect(aviso?.tono).toBe('error');
    // Lo escrito se conserva para corregirlo.
    expect(input('dir-direccion').value).toBe('Calle Nueva 9');
  });

  it('discards the changes', () => {
    crear(PERFIL);

    escribir('dir-direccion', 'Otra dirección');
    boton('Descartar')!.click();
    listaDe('provincias', 'departamento_id', '15').flush(PROVINCIAS_LIMA);
    listaDe('distritos', 'provincia_id', '1501').flush(DISTRITOS_LIMA);
    fixture.detectChanges();

    expect(input('dir-direccion').value).toBe('Av. Los Girasoles 123');
    expect(select('dir-distrito').value).toBe('150131');
    expect(boton('Descartar')).toBeUndefined();
  });

  it('warns when the catalog cannot be loaded', () => {
    TestBed.inject(PerfilStore).cargar().subscribe();
    httpMock.expectOne(PERFIL_URL).flush({ ...PERFIL, direccion: null, ubicacion: null });
    fixture = TestBed.createComponent(CuentaDireccionCard);
    fixture.detectChanges();
    httpMock
      .expectOne(`${UBIGEO_URL}/departamentos`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar las ubicaciones',
    );
  });
});
