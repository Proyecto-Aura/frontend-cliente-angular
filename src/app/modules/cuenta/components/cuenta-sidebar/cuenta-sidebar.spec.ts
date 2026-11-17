import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { Session } from '../../../../shared/auth/session';
import { CuentaSidebar } from './cuenta-sidebar';

describe('CuentaSidebar', () => {
  const LOGOUT = `${environment.apiUrl}/auth/logout`;
  let fixture: ComponentFixture<CuentaSidebar>;
  let httpMock: HttpTestingController;
  let session: Session;
  let navegar: ReturnType<typeof vi.spyOn>;

  const boton = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(Session);
    session.start('jwt', ['cliente']);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(CuentaSidebar);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('logs out and goes to the login (HU-B-004)', () => {
    expect(boton().textContent).toContain('Cerrar Sesión');

    boton().click();
    fixture.detectChanges();
    expect(boton().disabled).toBe(true);

    httpMock.expectOne(LOGOUT).flush({ message: 'Sesión cerrada' });

    expect(session.isAuthenticated()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
  });

  it('still goes to the login when the API fails', () => {
    boton().click();
    httpMock.expectOne(LOGOUT).flush(null, { status: 500, statusText: 'Error' });

    expect(session.isAuthenticated()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
  });
});
