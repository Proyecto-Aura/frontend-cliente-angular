import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../../environments/environment';
import { Session } from '../../auth/session';
import { ESPERA_BUSQUEDA_MS, Header } from './header';

@Component({ imports: [Header], template: '<app-header />' })
class ConHeader {}

describe('Header', () => {
  let harness: RouterTestingHarness;

  const raiz = () => harness.routeNativeElement!;
  const enlace = (texto: string) =>
    [...raiz().querySelectorAll('a')].find((a) => a.textContent!.includes(texto));

  const crear = async (url = '/catalogo') => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'catalogo', component: ConHeader },
          { path: 'nosotros', component: ConHeader },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create(url);
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('marks the current page in the menu', async () => {
    await crear();

    const nav = [...raiz().querySelectorAll('nav a')];
    expect(nav.map((a) => a.textContent!.trim())).toEqual(['Nosotros', 'Catálogo', 'Contacto']);
    expect(nav[1].getAttribute('aria-current')).toBe('page');
  });

  it('offers to log in when there is no session', async () => {
    await crear();

    expect(enlace('Iniciar sesión')?.getAttribute('href')).toBe('/auth/login');
    expect(raiz().textContent).not.toContain('Mi cuenta');
  });

  it('opens the "Mi cuenta" menu for a logged-in client', async () => {
    localStorage.setItem('francos.access_token', 'jwt');
    TestBed.resetTestingModule();
    await crear();
    expect(TestBed.inject(Session).isAuthenticated()).toBe(true);

    raiz().querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!.click();
    harness.detectChanges();

    expect(enlace('Mi perfil')?.getAttribute('href')).toBe('/mi-cuenta');
  });

  it('logs out from the "Mi cuenta" menu and goes to the login (HU-B-004)', async () => {
    localStorage.setItem('francos.access_token', 'jwt');
    TestBed.resetTestingModule();
    await crear();
    const httpMock = TestBed.inject(HttpTestingController);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    raiz().querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!.click();
    harness.detectChanges();
    [...raiz().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((b) => b.textContent!.includes('Cerrar sesión'))!
      .click();
    httpMock.expectOne(`${environment.apiUrl}/auth/logout`).flush({ message: 'Sesión cerrada' });

    expect(TestBed.inject(Session).isAuthenticated()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
    httpMock.verify();
  });

  it('searches the catalog once the client stops typing, from any page', async () => {
    await crear('/nosotros');
    vi.useFakeTimers();
    const input = raiz().querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = 'chifle';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
    vi.useRealTimers();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/catalogo?q=chifle');
  });
});
