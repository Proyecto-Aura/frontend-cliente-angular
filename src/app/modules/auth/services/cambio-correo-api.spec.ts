import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { CambioCorreoApi } from './cambio-correo-api';

describe('CambioCorreoApi (HU-B-016)', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends the token from the link to confirm the new email', () => {
    let respuesta: unknown;
    TestBed.inject(CambioCorreoApi)
      .verificar('abc123')
      .subscribe((r) => (respuesta = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/perfil/email/verificar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'abc123' });
    req.flush({ message: 'Correo actualizado correctamente' });

    expect(respuesta).toEqual({ message: 'Correo actualizado correctamente' });
  });
});
