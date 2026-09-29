import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest-guard';
import { Session } from './session';

describe('guestGuard', () => {
  let session: { isAuthenticated: ReturnType<typeof vi.fn> };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    session = { isAuthenticated: vi.fn() };
    router = { createUrlTree: vi.fn() };

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: Session, useValue: session },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('debe permitir el acceso (true) cuando NO hay sesión activa', () => {
    session.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('debe redirigir a /catalogo cuando ya hay sesión activa', () => {
    session.isAuthenticated.mockReturnValue(true);
    const urlTree = { toString: () => '/catalogo' };
    router.createUrlTree.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/catalogo']);
    expect(result).toBe(urlTree);
  });
});