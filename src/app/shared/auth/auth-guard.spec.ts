import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { Session } from './session';

describe('authGuard', () => {
  let session: { isAuthenticated: ReturnType<typeof vi.fn> };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    session = { isAuthenticated: vi.fn() };
    router = { createUrlTree: vi.fn() };

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/mi-cuenta/perfil' } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: Session, useValue: session },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('debe permitir el acceso (true) cuando hay sesión activa', () => {
    session.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('debe redirigir a /auth/login con returnUrl cuando no hay sesión', () => {
    session.isAuthenticated.mockReturnValue(false);
    const urlTree = { toString: () => '/auth/login?returnUrl=/mi-cuenta/perfil' };
    router.createUrlTree.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/mi-cuenta/perfil' },
    });
    expect(result).toBe(urlTree);
  });

  it('debe usar la URL completa del state.url como returnUrl', () => {
    session.isAuthenticated.mockReturnValue(false);
    mockState = { url: '/catalogo/productos/123?foo=bar' } as RouterStateSnapshot;
    const urlTree = { toString: () => '/auth/login?returnUrl=/catalogo/productos/123?foo=bar' };
    router.createUrlTree.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/catalogo/productos/123?foo=bar' },
    });
    expect(result).toBe(urlTree);
  });
});