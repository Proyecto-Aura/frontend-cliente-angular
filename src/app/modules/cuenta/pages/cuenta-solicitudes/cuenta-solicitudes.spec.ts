import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuentaSolicitudes } from './cuenta-solicitudes';
import { SOLICITUDES_DEMO } from '../../testing/solicitudes-data';

describe('CuentaSolicitudes', () => {
  let component: CuentaSolicitudes;
  let fixture: ComponentFixture<CuentaSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaSolicitudes],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaSolicitudes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('shows the requests heading in a named section', () => {
    expect(component).toBeTruthy();
    const raiz = fixture.nativeElement as HTMLElement;
    const titulo = raiz.querySelector('h1')!;

    expect(titulo.textContent?.trim()).toBe('Mis Solicitudes');
    expect(raiz.querySelector('section')?.getAttribute('aria-labelledby')).toBe(titulo.id);
    expect(raiz.textContent).toContain('Solicita y rastrea tus reembolsos de pedidos pagados.');
  });

  it('shows the four state indicators without pretending that requests were loaded', () => {
    const raiz = fixture.nativeElement as HTMLElement;
    const leyenda = raiz.querySelector('[aria-label="Estados de una solicitud"]')!;
    for (const estado of ['Pendiente', 'Aprobado', 'Rechazado', 'Reembolsado']) {
      expect(leyenda.textContent).toContain(estado);
    }
    expect(raiz.querySelectorAll('article')).toHaveLength(0);
    expect(raiz.textContent).toContain('Consulta tus solicitudes');
    expect(raiz.textContent).not.toContain('Sin solicitudes registradas.');
    expect(raiz.textContent).not.toContain('SOL-DEMO');
    expect(raiz.querySelector('button')?.disabled).toBe(true);
  });

  it('shows one card per explicitly supplied request', async () => {
    fixture.componentRef.setInput('solicitudes', SOLICITUDES_DEMO);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelectorAll('article')).toHaveLength(4);
    expect(raiz.querySelector('[aria-label="Solicitudes de reembolso"]')).not.toBeNull();
  });

  it('distinguishes an empty result from a not-yet-loaded list', async () => {
    fixture.componentRef.setInput('solicitudes', []);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.textContent).toContain('Sin solicitudes registradas.');
    expect(raiz.querySelector('article')).toBeNull();
    expect(raiz.textContent).not.toContain('Consulta tus solicitudes');
  });

  it('prioritizes loading and error states over any cards', async () => {
    fixture.componentRef.setInput('solicitudes', SOLICITUDES_DEMO);
    fixture.componentRef.setInput('cargando', true);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('section')?.getAttribute('aria-busy')).toBe('true');
    expect(raiz.querySelector('[role="status"]')?.textContent).toContain('Cargando');
    expect(raiz.querySelector('article')).toBeNull();

    fixture.componentRef.setInput('cargando', false);
    fixture.componentRef.setInput('error', 'No pudimos consultar las solicitudes.');
    await fixture.whenStable();
    expect(raiz.querySelector('[role="alert"]')?.textContent).toContain('No pudimos consultar');
    expect(raiz.querySelector('article')).toBeNull();
    const reintentar = vi.fn();
    component.reintentar.subscribe(reintentar);
    raiz.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    expect(reintentar).toHaveBeenCalledOnce();
  });

  it('emits UI actions only when enabled, without inserting a saved request', async () => {
    const nueva = vi.fn();
    const detalle = vi.fn();
    component.nuevaSolicitud.subscribe(nueva);
    component.verDetalle.subscribe(detalle);
    fixture.componentRef.setInput('solicitudes', SOLICITUDES_DEMO);
    fixture.componentRef.setInput('accionesDisponibles', true);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;
    raiz.querySelector('button')!.click();
    raiz.querySelector<HTMLButtonElement>('article button')!.click();
    expect(nueva).toHaveBeenCalledOnce();
    expect(detalle).toHaveBeenCalledExactlyOnceWith(1);
    expect(raiz.querySelectorAll('article')).toHaveLength(4);
  });
});
