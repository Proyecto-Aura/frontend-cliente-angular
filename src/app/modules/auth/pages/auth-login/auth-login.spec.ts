import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, throwError } from 'rxjs';
import { AuthLogin } from './auth-login';
import { AuthApi } from '../../services/auth-api';
import { LoginRequest } from '../../models/auth.model';

type AuthLoginTestInstance = AuthLogin & {
  onLogin: (credentials: LoginRequest) => void;
  enviando: () => boolean;
  error: () => string | null;
  recienRegistrado: boolean;
};

function createMockParamMap(params: Record<string, string | null>): ParamMap {
  return {
    has: vi.fn((key: string) => params[key] !== undefined && params[key] !== null),
    get: vi.fn((key: string) => params[key] ?? null),
    getAll: vi.fn((key: string) => (params[key] ? [params[key]!] : [])),
    keys: Object.keys(params).filter((k) => params[k] !== null),
  };
}

describe('AuthLogin', () => {
  let component: AuthLoginTestInstance;
  let fixture: ComponentFixture<AuthLogin>;
  let authApi: { login: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let activatedRoute: { snapshot: { queryParamMap: ParamMap } };

  const mockLoginRequest: LoginRequest = { identificador: 'test@test.com', password: '123456' };
  const mockLoginResponse = { access_token: 'token', roles: ['CLIENTE'], email_verificado: true, debe_cambiar_contrasena: false };

  beforeEach(() => {
    authApi = { login: vi.fn() };
    router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    activatedRoute = { snapshot: { queryParamMap: createMockParamMap({}) } };

    TestBed.configureTestingModule({
      imports: [AuthLogin],
      providers: [
        { provide: AuthApi, useValue: authApi },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    });

    fixture = TestBed.createComponent(AuthLogin);
    component = fixture.componentInstance as AuthLoginTestInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  async function runLoginTest(
    returnUrl: string | null,
    expectedUrl: string,
    loginSubject: Subject<typeof mockLoginResponse>
  ) {
    activatedRoute.snapshot.queryParamMap = createMockParamMap({ returnUrl });

    component.onLogin(mockLoginRequest);

    // enviando debe ser true inmediatamente después de llamar onLogin
    expect(component.enviando()).toBe(true);

    // Simular respuesta exitosa
    loginSubject.next(mockLoginResponse);
    loginSubject.complete();

    // esperar microtasks
    await Promise.resolve();

    expect(router.navigateByUrl).toHaveBeenCalledWith(expectedUrl);
    expect(component.enviando()).toBe(false);
    expect(component.error()).toBeNull();
  }

  describe('login exitoso', () => {
    let loginSubject: Subject<typeof mockLoginResponse>;

    beforeEach(() => {
      loginSubject = new Subject();
      authApi.login.mockReturnValue(loginSubject.asObservable());
      router.navigateByUrl.mockResolvedValue(true);
    });

    afterEach(() => {
      loginSubject.complete();
    });

    it('debe navegar a /catalogo cuando NO hay returnUrl', async () => {
      await runLoginTest(null, '/catalogo', loginSubject);
    });

    it('debe navegar a returnUrl cuando es una ruta relativa válida (empieza con / y no con //)', async () => {
      await runLoginTest('/mi-cuenta/pedidos', '/mi-cuenta/pedidos', loginSubject);
    });

    it('debe navegar a returnUrl con query params cuando es una ruta relativa válida completa', async () => {
      await runLoginTest('/catalogo?categoria=zapatos', '/catalogo?categoria=zapatos', loginSubject);
    });

    it('debe caer a /catalogo cuando returnUrl empieza con // (open redirect attempt)', async () => {
      await runLoginTest('//evil.com', '/catalogo', loginSubject);
    });

    it('debe caer a /catalogo cuando returnUrl es URL absoluta con protocolo (open redirect attempt)', async () => {
      await runLoginTest('https://evil.com', '/catalogo', loginSubject);
    });

    it('debe caer a /catalogo cuando returnUrl es URL absoluta sin protocolo pero con dominio', async () => {
      await runLoginTest('evil.com/path', '/catalogo', loginSubject);
    });

    it('debe caer a /catalogo cuando returnUrl es javascript: (XSS attempt)', async () => {
      await runLoginTest('javascript:alert(1)', '/catalogo', loginSubject);
    });
  });

  describe('error de login', () => {
    const mockError = new HttpErrorResponse({
      error: { message: 'Credenciales inválidas' },
      status: 401,
      statusText: 'Unauthorized',
    });

    beforeEach(() => {
      authApi.login.mockReturnValue(throwError(() => mockError));
    });

    it('debe mostrar mensaje de error y poner enviando en false', () => {
      component.onLogin(mockLoginRequest);

      expect(component.enviando()).toBe(false);
      expect(component.error()).toContain('Credenciales inválidas');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('debe usar mensaje genérico cuando el error no tiene message', () => {
      const genericError = new HttpErrorResponse({
        error: {},
        status: 500,
        statusText: 'Internal Server Error',
      });
      authApi.login.mockReturnValue(throwError(() => genericError));

      component.onLogin(mockLoginRequest);

      expect(component.error()).toContain('No pudimos iniciar sesión');
    });
  });

  describe('recienRegistrado', () => {
    it('debe ser true cuando queryParam registrado=1', () => {
      activatedRoute.snapshot.queryParamMap = createMockParamMap({ registrado: '1' });

      const newFixture = TestBed.createComponent(AuthLogin);
      const newComponent = newFixture.componentInstance as AuthLoginTestInstance;

      expect(newComponent.recienRegistrado).toBe(true);
    });

    it('debe ser false cuando queryParam registrado no es 1', () => {
      activatedRoute.snapshot.queryParamMap = createMockParamMap({ registrado: '0' });

      const newFixture = TestBed.createComponent(AuthLogin);
      const newComponent = newFixture.componentInstance as AuthLoginTestInstance;

      expect(newComponent.recienRegistrado).toBe(false);
    });

    it('debe ser false cuando queryParam registrado no existe', () => {
      activatedRoute.snapshot.queryParamMap = createMockParamMap({ registrado: null });

      const newFixture = TestBed.createComponent(AuthLogin);
      const newComponent = newFixture.componentInstance as AuthLoginTestInstance;

      expect(newComponent.recienRegistrado).toBe(false);
    });
  });
});