import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { CuentaSolicitudesPortal } from './cuenta-solicitudes-portal';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';
import {
  PAGINA_SOLICITUDES_PRUEBA,
  SOLICITUD_REGISTRADA_PRUEBA,
} from '../../testing/reembolsos-data';

describe('CuentaSolicitudesPortal', () => {
  prepararDialogoEnPruebas();
  it('renders the separate server texts in cards without fetching every detail', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CuentaSolicitudesPortal);
    const url = `${environment.apiUrl}/portal/reembolsos`;
    http
      .expectOne((r) => r.url === url)
      .flush({
        ...PAGINA_SOLICITUDES_PRUEBA,
        data: [
          {
            ...PAGINA_SOLICITUDES_PRUEBA.data[0],
            motivo: 'Otro: embalaje',
            descripcion: 'La bolsa recibida estaba rota.',
          },
        ],
      });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const textos = [...raiz.querySelectorAll('article p')].map((p) => p.textContent?.trim());
    expect(textos).toEqual(['Otro: embalaje', 'La bolsa recibida estaba rota.']);
    expect(raiz.textContent).not.toContain('SOL-DEMO');
    http.expectNone((r) => r.url.startsWith(`${url}/`));
    http.verify();
  });
  it('paginates server results and retries a failed list without showing example records', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CuentaSolicitudesPortal);
    const url = `${environment.apiUrl}/portal/reembolsos`;
    http.expectOne((r) => r.url === url).flush({}, { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelectorAll('article')).toHaveLength(0);
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No pudimos consultar');
    raiz.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    http
      .expectOne((r) => r.url === url && r.params.get('page') === '1')
      .flush({
        ...PAGINA_SOLICITUDES_PRUEBA,
        meta: { total: 11, page: 1, limit: 10, total_pages: 2 },
      });
    await fixture.whenStable();
    const nav = raiz.querySelector('nav')!;
    expect(nav.textContent).toContain('Página 1 de 2');
    expect(nav.querySelector('button')!.disabled).toBe(true);
    nav.querySelectorAll('button')[1].click();
    http
      .expectOne((r) => r.url === url && r.params.get('page') === '2')
      .flush({
        ...PAGINA_SOLICITUDES_PRUEBA,
        meta: { total: 11, page: 2, limit: 10, total_pages: 2 },
      });
    await fixture.whenStable();
    expect(nav.textContent).toContain('Página 2 de 2');
    expect(nav.querySelectorAll('button')[1].disabled).toBe(true);
    http.verify();
  });

  it('opens detail from its server id, retries errors and discards evidence on close', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CuentaSolicitudesPortal);
    const url = `${environment.apiUrl}/portal/reembolsos`;
    http.expectOne((r) => r.url === url).flush(PAGINA_SOLICITUDES_PRUEBA);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    const abrir = raiz.querySelector<HTMLButtonElement>('article button')!;
    abrir.focus();
    abrir.click();
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')?.textContent).toContain('Cargando detalle');
    http.expectOne(`${url}/31`).flush({}, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(raiz.querySelector('dialog [role="alert"]')?.textContent).toContain(
      'ya no está disponible',
    );
    raiz.querySelector<HTMLButtonElement>('dialog [role="alert"] button')!.click();
    http.expectOne(`${url}/31`).flush(SOLICITUD_REGISTRADA_PRUEBA);
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')?.textContent).toContain(
      SOLICITUD_REGISTRADA_PRUEBA.descripcion,
    );
    raiz.querySelector<HTMLButtonElement>('[aria-label="Cerrar detalle"]')!.click();
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(abrir);
    abrir.click();
    await fixture.whenStable();
    const nuevaConsulta = http.expectOne(`${url}/31`);
    expect(raiz.querySelector('dialog a')).toBeNull();
    raiz.querySelector<HTMLButtonElement>('[aria-label="Cerrar detalle"]')!.click();
    await fixture.whenStable();
    expect(nuevaConsulta.cancelled).toBe(true);
    http.verify();
  });

  it('opens the real form from Nueva solicitud and shows the server confirmation without fabricating list records', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CuentaSolicitudesPortal);
    http
      .expectOne((r) => r.url === `${environment.apiUrl}/portal/reembolsos`)
      .flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    raiz.querySelector('button')!.click();
    await vi.waitFor(() => {
      const reqs = http.match((r) => r.url === `${environment.apiUrl}/portal/pedidos`);
      expect(reqs).toHaveLength(1);
      reqs[0].flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    });
    await fixture.whenStable();
    const formulario = fixture.debugElement.query(By.directive(CuentaNuevaSolicitud))
      .componentInstance as CuentaNuevaSolicitud;
    formulario.registrada.emit(SOLICITUD_REGISTRADA_PRUEBA);
    http
      .expectOne((r) => r.url === `${environment.apiUrl}/portal/reembolsos`)
      .flush(PAGINA_SOLICITUDES_PRUEBA);
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')).toBeNull();
    expect(raiz.querySelector('app-cuenta-solicitud-confirmacion')!.textContent).toContain(
      'REF-PRUEBA-001',
    );
    expect(raiz.querySelector('app-cuenta-solicitud-confirmacion')!.textContent).toContain(
      'Pendiente',
    );
    expect(raiz.querySelectorAll('article')).toHaveLength(1);
    http.verify();
  });
});
