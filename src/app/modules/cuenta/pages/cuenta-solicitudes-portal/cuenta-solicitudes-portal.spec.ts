import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { CuentaSolicitudesPortal } from './cuenta-solicitudes-portal';
import { CuentaNuevaSolicitud } from '../../components/cuenta-nueva-solicitud/cuenta-nueva-solicitud';
import { prepararDialogoEnPruebas } from '../../testing/dialogo-testing';
import { SOLICITUD_REGISTRADA_PRUEBA } from '../../testing/reembolsos-data';

describe('CuentaSolicitudesPortal', () => {
  prepararDialogoEnPruebas();
  it('opens the real form from Nueva solicitud and shows the server confirmation without fabricating list records', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CuentaSolicitudesPortal);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    raiz.querySelector('button')!.click();
    await vi.waitFor(() => {
      const reqs = http.match((r) => r.url === `${environment.apiUrl}/portal/pedidos`);
      expect(reqs).toHaveLength(1);
      reqs[0].flush({ data: [], meta: { total: 0, page: 1, limit: 10, total_pages: 0 } });
    });
    await fixture.whenStable();
    const formulario = fixture.debugElement.query(By.directive(CuentaNuevaSolicitud))
      .componentInstance as CuentaNuevaSolicitud;
    formulario.registrada.emit(SOLICITUD_REGISTRADA_PRUEBA);
    await fixture.whenStable();
    expect(raiz.querySelector('dialog')).toBeNull();
    expect(raiz.querySelector('app-cuenta-solicitud-confirmacion')!.textContent).toContain(
      'REF-PRUEBA-001',
    );
    expect(raiz.querySelector('app-cuenta-solicitud-confirmacion')!.textContent).toContain(
      'Pendiente',
    );
    expect(raiz.querySelectorAll('article')).toHaveLength(0);
    http.verify();
  });
});
