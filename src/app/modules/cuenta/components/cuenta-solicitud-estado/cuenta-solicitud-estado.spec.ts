import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ESTADOS_SOLICITUD } from '../../models/solicitud-vista.model';
import { CuentaSolicitudEstado } from './cuenta-solicitud-estado';

describe('CuentaSolicitudEstado', () => {
  let fixture: ComponentFixture<CuentaSolicitudEstado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaSolicitudEstado],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaSolicitudEstado);
  });

  it.each(ESTADOS_SOLICITUD)('identifies %s with both text and an icon', async (estado) => {
    fixture.componentRef.setInput('estado', estado);
    await fixture.whenStable();
    const raiz = fixture.nativeElement as HTMLElement;

    expect(raiz.textContent?.trim()).toBe(estado.charAt(0).toUpperCase() + estado.slice(1));
    expect(raiz.querySelector('app-icon svg')).not.toBeNull();
    expect(raiz.querySelector('app-icon')?.getAttribute('aria-hidden')).toBe('true');
  });
});
