import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { CuentaPedidos } from './cuenta-pedidos';
import { PEDIDO_DETALLE_PRUEBA, PEDIDO_RESUMEN_PRUEBA } from '../../testing/pedidos-data';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';

describe('CuentaPedidos', () => {
  prepararDialogoEnPruebas();
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/portal/pedidos`;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads an empty real page and does not substitute example orders', async () => {
    const fixture = TestBed.createComponent(CuentaPedidos);
    http
      .expectOne((r) => r.url === url)
      .flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('h1')?.textContent?.trim()).toBe('Mis Pedidos');
    expect(raiz.textContent).toContain('Aún no tienes pedidos');
    expect(raiz.querySelector('article')).toBeNull();
    expect(raiz.textContent).not.toContain('DEMO');
    expect(raiz.querySelector('a')?.getAttribute('href')).toBe('/catalogo');
  });

  it('retries list errors and opens the selected order with fresh data, keeping submission unavailable', async () => {
    const fixture = TestBed.createComponent(CuentaPedidos);
    const raiz = fixture.nativeElement as HTMLElement;
    http.expectOne((r) => r.url === url).flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(raiz.querySelector('[role=alert]')).not.toBeNull();
    raiz.querySelector<HTMLButtonElement>('[role=alert] button')!.click();
    http
      .expectOne((r) => r.url === url)
      .flush({
        data: [PEDIDO_RESUMEN_PRUEBA],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });
    http.expectOne(`${url}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    await fixture.whenStable();
    raiz.querySelector<HTMLButtonElement>('article button')!.click();
    await vi.waitFor(() => {
      const peticiones = http.match((r) => r.url === url);
      expect(peticiones).toHaveLength(1);
      peticiones[0].flush({
        data: [PEDIDO_RESUMEN_PRUEBA],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });
      http.expectOne(`${url}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    });
    await fixture.whenStable();
    expect(raiz.querySelector<HTMLSelectElement>('#solicitud-pedido_id')!.value).toBe('21');
    expect(raiz.querySelector<HTMLInputElement>('#solicitud-importe')!.value).toBe('12.00');
    expect(raiz.querySelector<HTMLButtonElement>('dialog button[type=submit]')!.disabled).toBe(
      true,
    );
    raiz.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')).toBeNull();
  });
});
