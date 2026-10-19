import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { Session } from '../../auth/session';
import { authTokenInterceptor } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    TestBed.inject(Session).start('jwt', ['cliente']);
  });

  afterEach(() => httpMock.verify());

  const autorizacion = (url: string) => {
    http.get(url).subscribe();
    const req = httpMock.expectOne(url);
    req.flush({});
    return req.request.headers.get('Authorization');
  };

  it('adds the bearer token to API calls', () => {
    expect(autorizacion(`${environment.apiUrl}/pedidos`)).toBe('Bearer jwt');
  });

  it('does not add it to the public login call', () => {
    expect(autorizacion(`${environment.apiUrl}/auth/login`)).toBeNull();
  });

  it('does not add it to other hosts', () => {
    expect(autorizacion('https://example.com/data')).toBeNull();
  });
});
