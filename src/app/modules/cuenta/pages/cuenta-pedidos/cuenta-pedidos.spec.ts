import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { CuentaPedidos } from './cuenta-pedidos';
import { PEDIDO_DETALLE_PRUEBA, PEDIDO_RESUMEN_PRUEBA } from '../../testing/pedidos-data';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';
import { SOLICITUD_REGISTRADA_PRUEBA } from '../../testing/reembolsos-data';

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

  it('retries list errors and opens the selected order with fresh data, enabling submission', async () => {
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
      false,
    );
    raiz.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')).toBeNull();
  });

  it('confirms a saved request, closes the modal and reloads orders to remove the duplicate action', async () => {
    const fixture = TestBed.createComponent(CuentaPedidos);
    const raiz = fixture.nativeElement as HTMLElement;
    const lista = () => http.expectOne((r) => r.url === url);
    lista().flush({
      data: [PEDIDO_RESUMEN_PRUEBA],
      meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
    });
    http.expectOne(`${url}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    await fixture.whenStable();
    raiz.querySelector<HTMLButtonElement>('article button')!.click();
    await vi.waitFor(() => {
      const reqs = http.match((r) => r.url === url);
      expect(reqs).toHaveLength(1);
      reqs[0].flush({
        data: [PEDIDO_RESUMEN_PRUEBA],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });
      http.expectOne(`${url}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    });
    await fixture.whenStable();
    const motivo = raiz.querySelector<HTMLSelectElement>('#solicitud-motivo')!;
    motivo.value = 'Otro';
    motivo.dispatchEvent(new Event('input', { bubbles: true }));
    const descripcion = raiz.querySelector<HTMLTextAreaElement>('textarea')!;
    descripcion.value = 'Evidencia exclusiva de pruebas locales.';
    descripcion.dispatchEvent(new Event('input', { bubbles: true }));
    const archivo = raiz.querySelector<HTMLInputElement>('input[type=file]')!;
    Object.defineProperty(archivo, 'files', {
      value: [new File(['prueba'], 'prueba.pdf', { type: 'application/pdf' })],
    });
    archivo.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    raiz
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    http
      .expectOne(`${environment.apiUrl}/portal/reembolsos`)
      .flush(SOLICITUD_REGISTRADA_PRUEBA, { status: 201, statusText: 'Created' });
    lista().flush({
      data: [{ ...PEDIDO_RESUMEN_PRUEBA, reembolso: { id: 31, estado: 'pendiente' } }],
      meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
    });
    http.expectOne(`${url}/21`).flush(PEDIDO_DETALLE_PRUEBA);
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')).toBeNull();
    expect(raiz.querySelector('app-cuenta-solicitud-confirmacion')!.textContent).toContain(
      'REF-PRUEBA-001',
    );
    expect(raiz.querySelector('app-cuenta-solicitud-confirmacion')!.textContent).toContain(
      'Pendiente',
    );
    expect(raiz.querySelector('article')!.textContent).toContain(
      'Solicitud de reembolso registrada',
    );
    expect(raiz.querySelector('article button')).toBeNull();
    expect(document.activeElement).toBe(raiz.querySelector('app-cuenta-solicitud-confirmacion'));
  });
});
