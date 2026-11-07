import { TestBed } from '@angular/core/testing';
import { CuentaSolicitudConfirmacion } from './cuenta-solicitud-confirmacion';
import { SOLICITUD_REGISTRADA_PRUEBA } from '../../testing/reembolsos-data';

describe('CuentaSolicitudConfirmacion', () => {
  it('announces the server reference, paid amount and pending state as text and receives focus', async () => {
    const fixture = TestBed.createComponent(CuentaSolicitudConfirmacion);
    fixture.componentRef.setInput('solicitud', {
      ...SOLICITUD_REGISTRADA_PRUEBA,
      codigo: '<img src=x onerror=alert(1)>',
    });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.getAttribute('role')).toBe('status');
    expect(raiz.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(raiz.querySelector('img')).toBeNull();
    expect(raiz.textContent).toMatch(/S\/\s*12\.00/);
    expect(raiz.textContent).toContain('Pendiente');
    expect(document.activeElement).toBe(raiz);
  });
});
