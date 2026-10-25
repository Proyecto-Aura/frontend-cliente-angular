import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { ItemCatalogo } from '../models/catalogo.model';
import { ITEMS, pagina } from '../testing/catalogo-data';
import { CatalogoApi } from './catalogo-api';

describe('CatalogoApi', () => {
  const PRODUCTOS = `${environment.apiUrl}/catalogo/productos`;
  let api: CatalogoApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CatalogoApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends the search, category and price order to the API', () => {
    api.listar({ q: 'chifle', categoriaId: 1, orden: 'precio_asc' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === PRODUCTOS);
    expect(req.request.params.toString()).toBe(
      'page=1&limit=100&q=chifle&categoria_id=1&orden=precio_asc',
    );
    req.flush(pagina([]));
  });

  it('leaves out the filters that are not set', () => {
    api.listar({ q: '', categoriaId: null, orden: null }).subscribe();

    const req = httpMock.expectOne((r) => r.url === PRODUCTOS);
    expect(req.request.params.toString()).toBe('page=1&limit=100');
    req.flush(pagina([]));
  });

  it('brings every page so that no product is split between pages', () => {
    let items: ItemCatalogo[] = [];
    api.listar({ q: '', categoriaId: null, orden: null }).subscribe((r) => (items = r));

    httpMock
      .expectOne((r) => r.url === PRODUCTOS && r.params.get('page') === '1')
      .flush(pagina(ITEMS.slice(0, 2), 1, 2));
    httpMock
      .expectOne((r) => r.url === PRODUCTOS && r.params.get('page') === '2')
      .flush(pagina(ITEMS.slice(2), 2, 2));

    expect(items.map((i) => i.id)).toEqual([101, 102, 201]);
  });

  it('gets the detail of a product', () => {
    api.obtener(10).subscribe();

    httpMock.expectOne(`${PRODUCTOS}/10`).flush({});
  });
});
