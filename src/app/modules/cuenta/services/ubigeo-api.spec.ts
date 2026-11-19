import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { UbigeoApi } from './ubigeo-api';

describe('UbigeoApi', () => {
  const URL = `${environment.apiUrl}/ubigeo`;
  let api: UbigeoApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(UbigeoApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the departments', () => {
    let items: unknown;
    api.departamentos().subscribe((r) => (items = r));
    httpMock.expectOne(`${URL}/departamentos`).flush([{ id: '15', nombre: 'Lima' }]);
    expect(items).toEqual([{ id: '15', nombre: 'Lima' }]);
  });

  it('lists the provinces of a department', () => {
    api.provincias('15').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${URL}/provincias`);
    expect(req.request.params.get('departamento_id')).toBe('15');
    req.flush([]);
  });

  it('lists the districts of a province', () => {
    api.distritos('1501').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${URL}/distritos`);
    expect(req.request.params.get('provincia_id')).toBe('1501');
    req.flush([]);
  });
});
