import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SOLICITUDES_DEMO } from '../../testing/solicitudes-data';
import { CuentaSolicitudCard } from './cuenta-solicitud-card';

describe('CuentaSolicitudCard', () => {
  let component: CuentaSolicitudCard;
  let fixture: ComponentFixture<CuentaSolicitudCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaSolicitudCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaSolicitudCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('solicitud', SOLICITUDES_DEMO[0]);
    await fixture.whenStable();
  });

  it('shows the request, order, amount, date and explicit description', () => {
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.textContent).toContain('SOL-DEMO-001');
    expect(raiz.textContent).toContain('PED-DEMO-001');
    expect(raiz.textContent).toMatch(/S\/\s*10\.40/);
    expect(raiz.textContent).toContain(SOLICITUDES_DEMO[0].descripcion);
    expect(raiz.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-12T12:00:00Z');
  });

  it('does not invent optional texts and renders untrusted text without interpreting HTML', async () => {
    fixture.componentRef.setInput('solicitud', {
      ...SOLICITUDES_DEMO[0],
      motivo: '<img src=x onerror=alert(1)>',
      descripcion: undefined,
    });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(raiz.querySelector('img')).toBeNull();
    expect(raiz.textContent).not.toContain('El producto recibido');
  });

  it('keeps detail unavailable until explicitly enabled and emits only the selected id', async () => {
    const detalle = vi.fn();
    component.verDetalle.subscribe(detalle);
    const boton = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(boton.disabled).toBe(true);
    boton.click();
    expect(detalle).not.toHaveBeenCalled();

    fixture.componentRef.setInput('detalleDisponible', true);
    await fixture.whenStable();
    boton.click();
    expect(detalle).toHaveBeenCalledExactlyOnceWith(1);
  });
});
