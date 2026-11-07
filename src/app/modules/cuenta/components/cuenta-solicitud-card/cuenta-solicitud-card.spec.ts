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
    expect(raiz.querySelectorAll('p')[0].textContent?.trim()).toBe('Producto incorrecto');
    expect(raiz.querySelectorAll('p')[1].textContent?.trim()).toBe(SOLICITUDES_DEMO[0].descripcion);
    expect(raiz.querySelector('article')?.getAttribute('aria-labelledby')).toBe(
      raiz.querySelector('h2')?.id,
    );
    expect(raiz.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-12T12:00:00Z');
    expect(raiz.querySelector('time')?.textContent?.trim()).toBe('12 Oct, 2026');
  });

  it.each([
    { motivo: 'Otro: embalaje', descripcion: null, textos: ['Otro: embalaje'] },
    {
      motivo: null,
      descripcion: 'Descripción histórica disponible.',
      textos: ['Descripción histórica disponible.'],
    },
    { motivo: null, descripcion: null, textos: [] },
  ])('omits absent historical texts without inventing or splitting them: %j', async (datos) => {
    fixture.componentRef.setInput('solicitud', { ...SOLICITUDES_DEMO[0], ...datos });
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect([...raiz.querySelectorAll('p')].map((p) => p.textContent?.trim())).toEqual(datos.textos);
    expect(raiz.textContent).not.toMatch(/null|undefined|Solicitud de reembolso/);
    expect(raiz.textContent).toContain('SOL-DEMO-001');
  });

  it.each([
    ['pendiente', 'Pendiente'],
    ['aprobado', 'Aprobado'],
    ['rechazado', 'Rechazado'],
    ['reembolsado', 'Reembolsado'],
  ])(
    'labels the actual %s state and keeps its detail action accessible',
    async (estado, etiqueta) => {
      fixture.componentRef.setInput('solicitud', { ...SOLICITUDES_DEMO[0], estado });
      fixture.componentRef.setInput('detalleDisponible', true);
      await fixture.whenStable();
      const raiz = fixture.nativeElement as HTMLElement;
      expect(raiz.querySelector('app-cuenta-solicitud-estado')?.textContent?.trim()).toBe(etiqueta);
      expect(raiz.querySelector('button')?.getAttribute('aria-label')).toBe(
        'Ver detalle de la solicitud SOL-DEMO-001',
      );
    },
  );

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
