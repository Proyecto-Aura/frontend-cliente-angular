import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { Session } from './session';
import { sesionGuard } from './sesion.guard';

describe('sesionGuard', () => {
  const ejecutar = () =>
    TestBed.runInInjectionContext(() => sesionGuard({} as never, {} as never));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('lets a logged-in client in', () => {
    TestBed.inject(Session).start('jwt', ['cliente']);

    expect(ejecutar()).toBe(true);
  });

  it('sends to the login when there is no session (HU-B-004)', () => {
    const resultado = ejecutar() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/auth/login');
  });
});
