import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { PerfilCliente } from '../models/perfil.model';
import { PerfilStore } from './perfil-store';

describe('PerfilStore', () => {
  const PERFIL: PerfilCliente = {
    nombres: 'Rosa Elena',
    apellido_paterno: 'Quispe',
    apellido_materno: 'Huamán',
    email: 'rosa@francos.test',
    telefono: null,
    tipo_documento: 'dni',
    numero_documento: '45678912',
    tipo_cliente: 'persona_natural',
    razon_social: null,
  };
  let store: PerfilStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('francos.access_token', 'jwt');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(PerfilStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows the name, initials and type of a natural person', () => {
    store.cargar().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/perfil`).flush(PERFIL);

    expect(store.nombreVisible()).toBe('Rosa Elena Quispe');
    expect(store.iniciales()).toBe('RQ');
    expect(store.tipoVisible()).toBe('Persona natural');
  });

  it('shows the business name of a company', () => {
    store.cargar().subscribe();
    httpMock
      .expectOne(`${environment.apiUrl}/perfil`)
      .flush({ ...PERFIL, tipo_cliente: 'empresa', razon_social: 'Snacks del Norte SAC' });

    expect(store.nombreVisible()).toBe('Snacks del Norte SAC');
    expect(store.tipoVisible()).toBe('Empresa');
  });

  it('forgets the profile when the session is closed', () => {
    store.cargar().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/perfil`).flush(PERFIL);
    TestBed.tick();

    TestBed.inject(Session).clear();
    TestBed.tick();

    expect(store.perfil()).toBeNull();
  });
});
