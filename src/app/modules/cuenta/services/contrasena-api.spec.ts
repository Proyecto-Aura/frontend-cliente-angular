import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { ContrasenaApi } from './contrasena-api';

describe('ContrasenaApi (HU-B-017)', () => {
  let api: ContrasenaApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ContrasenaApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends the current, new and confirmed password to the backend', () => {
    const datos = {
      contrasena_actual: 'Actual1234',
      nueva_contrasena: 'Nueva1234',
      confirmar_contrasena: 'Nueva1234',
    };
    let respuesta: unknown;

    api.cambiar(datos).subscribe((r) => (respuesta = r));
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/cambiar-contrasena`);
    req.flush({ message: 'Contraseña actualizada' });

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    expect(respuesta).toEqual({ message: 'Contraseña actualizada' });
  });
});
