import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../../../environments/environment';
import { ItemCatalogo } from '../../models/catalogo.model';
import { ITEMS, pagina } from '../../testing/catalogo-data';
import { ListarProductos } from './listar-productos';

describe('ListarProductos (HU-B-005)', () => {
  const PRODUCTOS = `${environment.apiUrl}/catalogo/productos`;
  let harness: RouterTestingHarness;
  let httpMock: HttpTestingController;

  const raiz = () => harness.routeNativeElement!;
  const tarjetas = () => [...raiz().querySelectorAll('app-catalogo-product-card')];
  const nombres = () => tarjetas().map((t) => t.querySelector('h3')!.textContent!.trim());
  const texto = () => raiz().textContent!.replace(/\s+/g, ' ');
  const boton = (label: string) =>
    [...raiz().querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes(label),
    )!;
  const url = () => TestBed.inject(Router).url;

  /** Responde las peticiones pendientes del listado y deja la vista al día. */
  const responder = async (
    data: ItemCatalogo[] | ((req: TestRequest) => void),
  ): Promise<TestRequest> => {
    TestBed.tick();
    const reqs = httpMock.match((r) => r.url === PRODUCTOS);
    expect(reqs.length).toBeGreaterThan(0);
    for (const req of reqs) {
      if (typeof data === 'function') data(req);
      else req.flush(pagina(data));
    }
    await harness.fixture.whenStable();
    harness.detectChanges();
    return reqs[reqs.length - 1];
  };

  /** Hace clic y espera la navegación que dispara (sin esperar al HTTP). */
  const clicYNavegar = async (boton: HTMLButtonElement) => {
    const navegado = firstValueFrom(
      TestBed.inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd)),
    );
    boton.click();
    await navegado;
  };

  const elegir = async (filtro: string, opcion: string) => {
    raiz().querySelector<HTMLButtonElement>(`button[aria-label="${filtro}"]`)!.click();
    harness.detectChanges();
    await clicYNavegar(
      [...raiz().querySelectorAll<HTMLButtonElement>('[role="option"]')].find(
        (b) => b.textContent!.trim() === opcion,
      )!,
    );
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'catalogo', component: ListarProductos }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/catalogo');
    // El listado y las categorías (sin filtros) piden lo mismo.
    await responder(ITEMS);
  });

  afterEach(() => httpMock.verify());

  it('shows one card per active product (RF-B15)', () => {
    expect(nombres()).toEqual(['Chifle salado', 'Mix de frutos']);
    expect(texto()).toContain('Mostrando 2 productos');
    expect(texto()).toContain('Snacks naturales del Perú');
  });

  it('filters by category, taken from the products (RF-B16)', async () => {
    await elegir('Categoría', 'Frutos secos');

    expect(url()).toBe('/catalogo?categoria=2');
    const req = await responder([ITEMS[2]]);
    expect(req.request.params.get('categoria_id')).toBe('2');
    expect(nombres()).toEqual(['Mix de frutos']);
    expect(raiz().querySelector('button[aria-label="Categoría"]')?.textContent).toContain(
      'Frutos secos',
    );
  });

  it('orders by price (RF-B16)', async () => {
    await elegir('Ordenar', 'Precio: mayor a menor');

    expect(url()).toBe('/catalogo?orden=precio_desc');
    const req = await responder([...ITEMS].reverse());
    expect(req.request.params.get('orden')).toBe('precio_desc');
    expect(nombres()).toEqual(['Mix de frutos', 'Chifle salado']);
  });

  it('searches by name from the URL that the header search sets (RF-B16)', async () => {
    await harness.navigateByUrl('/catalogo?q=mix');

    const req = await responder([ITEMS[2]]);
    expect(req.request.params.get('q')).toBe('mix');
    expect(texto()).toMatch(/Mostrando 1 producto\s*para «mix»/);
  });

  it('shows "Sin resultados" and clears the filters', async () => {
    await harness.navigateByUrl('/catalogo?categoria=1&q=zzz');
    await responder([]);
    expect(texto()).toContain('Sin resultados');

    await clicYNavegar(boton('Limpiar filtros'));

    expect(url()).toBe('/catalogo');
    await responder(ITEMS);
    expect(nombres()).toHaveLength(2);
  });

  it('opens and closes the product detail (RF-B17)', async () => {
    [...tarjetas()[0].querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent!.includes('Ver detalle'))!
      .click();
    harness.detectChanges();
    TestBed.tick();

    httpMock.expectOne(`${PRODUCTOS}/10`).flush({ ...ITEMS[0], presentaciones: [] });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(raiz().querySelector('[role="dialog"]')).not.toBeNull();

    raiz().querySelector<HTMLButtonElement>('[aria-label="Cerrar"]')!.click();
    harness.detectChanges();
    expect(raiz().querySelector('[role="dialog"]')).toBeNull();
  });

  it('lets the client retry when the catalog cannot be loaded', async () => {
    await harness.navigateByUrl('/catalogo?categoria=1');
    await responder((req) => req.flush(null, { status: 500, statusText: 'Error' }));
    expect(raiz().querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar el catálogo',
    );

    boton('Reintentar').click();
    await responder(ITEMS);
    expect(nombres()).toHaveLength(2);
  });
});
