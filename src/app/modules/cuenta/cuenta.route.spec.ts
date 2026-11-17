import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../environments/environment';
import { Session } from '../../shared/auth/session';
import { CUENTA_ROUTES } from './cuenta.route';
import { PerfilCliente } from './models/perfil.model';

@Component({ template: '<h1>Iniciar sesión</h1>' })
class LoginPrueba {}

const PERFIL: PerfilCliente = {
  nombres: 'Rosa',
  apellido_paterno: 'Quispe',
  apellido_materno: 'Pérez',
  email: 'rosa@example.test',
  telefono: null,
  tipo_documento: 'DNI',
  numero_documento: '12345678',
  tipo_cliente: 'persona_natural',
  razon_social: null,
};

describe('CUENTA_ROUTES (HU-B-014)', () => {
  let httpMock: HttpTestingController;
  let session: Session;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'mi-cuenta', children: CUENTA_ROUTES },
          { path: 'auth/login', component: LoginPrueba },
        ]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(Session);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  const responderPerfil = () => {
    for (const req of httpMock.match(`${environment.apiUrl}/perfil`)) req.flush(PERFIL);
    for (const req of httpMock.match(
      (r) => r.url === `${environment.apiUrl}/portal/notificaciones`,
    )) {
      req.flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    }
    for (const req of httpMock.match((r) => r.url === `${environment.apiUrl}/portal/reembolsos`)) {
      req.flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    }
  };

  it('redirects direct access to requests to the real login route without a session', async () => {
    const harness = await RouterTestingHarness.create('/mi-cuenta/solicitudes');

    expect(TestBed.inject(Router).url).toBe('/auth/login');
    expect(harness.routeNativeElement?.textContent).toContain('Iniciar sesión');
    httpMock.expectNone(`${environment.apiUrl}/perfil`);
  });

  it('also protects the isolated development preview', async () => {
    await RouterTestingHarness.create('/mi-cuenta/solicitudes/vista-previa');
    expect(TestBed.inject(Router).url).toBe('/auth/login');
  });

  it('protects direct access to real orders without a session', async () => {
    await RouterTestingHarness.create('/mi-cuenta/pedidos');
    expect(TestBed.inject(Router).url).toBe('/auth/login');
    httpMock.expectNone((r) => r.url.includes('/portal/pedidos'));
  });

  it('loads requests inside the account layout and marks its sidebar link as current', async () => {
    session.start('jwt-prueba', ['cliente']);
    const harness = await RouterTestingHarness.create('/mi-cuenta/solicitudes');
    responderPerfil();
    await harness.fixture.whenStable();
    const raiz = harness.routeNativeElement!;
    const nav = raiz.querySelector('nav[aria-label="Mi cuenta"]')!;
    const enlace = nav.querySelector('a[href="/mi-cuenta/solicitudes"]')!;

    expect(raiz.querySelector('app-cuenta-sidebar')).not.toBeNull();
    expect(raiz.querySelector('h1')?.textContent?.trim()).toBe('Mis Solicitudes');
    expect(document.activeElement).toBe(raiz.querySelector('h1'));
    const contenido = raiz.querySelector('app-cuenta-solicitudes-portal')!;
    const avisos = raiz.querySelector('app-cuenta-notificaciones')!;
    expect(
      contenido.compareDocumentPosition(avisos) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(enlace.getAttribute('aria-current')).toBe('page');
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(
      nav.querySelector('a[href="/mi-cuenta/perfil"]')?.getAttribute('aria-current'),
    ).toBeNull();
  });

  it('keeps profile navigation and prevents entering requests after the session is cleared', async () => {
    session.start('jwt-prueba', ['cliente']);
    const harness = await RouterTestingHarness.create('/mi-cuenta/perfil');
    responderPerfil();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe('Mi Perfil');

    session.clear();
    await harness.navigateByUrl('/mi-cuenta/solicitudes', LoginPrueba);

    expect(TestBed.inject(Router).url).toBe('/auth/login');
  });
});
