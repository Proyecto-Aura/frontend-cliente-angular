import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';
import { DETALLES_DEMO } from '../../testing/solicitudes-data';
import { CuentaSolicitudDetalle } from './cuenta-solicitud-detalle';

describe('CuentaSolicitudDetalle', () => {
  let fixture: ComponentFixture<CuentaSolicitudDetalle>;
  let origen: HTMLButtonElement;

  // JSDOM no implementa los diálogos nativos. El aislamiento real se prueba en Chromium.
  beforeAll(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaSolicitudDetalle],
    }).compileComponents();

    origen = document.createElement('button');
    origen.textContent = 'Ver detalle';
    document.body.append(origen);
    origen.focus();
  });

  afterEach(() => {
    fixture?.destroy();
    origen.remove();
  });

  const crear = async (solicitud: SolicitudDetalle = DETALLES_DEMO[0]) => {
    fixture = TestBed.createComponent(CuentaSolicitudDetalle);
    fixture.componentRef.setInput('solicitud', solicitud);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  };

  it('opens a named modal with initial focus on close and restores focus when closed', async () => {
    const dialogo = await crear();
    const cerrar = vi.fn();
    fixture.componentInstance.cerrar.subscribe(cerrar);
    const boton = dialogo.querySelector<HTMLButtonElement>('[aria-label="Cerrar detalle"]')!;
    expect(dialogo.open).toBe(true);
    expect(document.activeElement).toBe(boton);
    expect(
      document.getElementById(dialogo.getAttribute('aria-labelledby')!)?.textContent,
    ).toContain('SOL-DEMO-001');
    expect(document.body.style.overflow).toBe('hidden');

    boton.click();
    expect(dialogo.open).toBe(false);
    expect(cerrar).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(origen);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it.each(DETALLES_DEMO)('shows only published detail fields for $estado', async (solicitud) => {
    const dialogo = await crear(solicitud);
    expect(dialogo.textContent).toContain(solicitud.pedido.codigo);
    expect(dialogo.textContent).toContain(solicitud.motivo_cliente);
    expect(dialogo.textContent).toContain('Estado actual:');
    const etiquetas = [...dialogo.querySelectorAll('dt')].map((e) => e.textContent?.trim());
    expect(etiquetas.includes('Fecha de resolución')).toBe(!!solicitud.fecha_resolucion);
    expect(etiquetas.includes('Motivo del rechazo')).toBe(solicitud.estado === 'rechazado');
    expect(etiquetas.includes('Evidencia')).toBe(!!solicitud.evidencia);
    expect(etiquetas).not.toContain('Producto');
    expect(etiquetas).not.toContain('Método de devolución');
    expect(dialogo.querySelectorAll('ol li')).toHaveLength(2);
  });

  it('keeps Tab and Shift+Tab inside the modal', async () => {
    const dialogo = await crear();
    const botones = dialogo.querySelectorAll('button');
    const primero = botones[0];
    const ultimo = botones[botones.length - 1];
    primero.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(ultimo);
    ultimo.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(primero);
  });

  it('handles the native Escape cancellation and returns focus to its origin', async () => {
    const dialogo = await crear();
    const cerrar = vi.fn();
    fixture.componentInstance.cerrar.subscribe(cerrar);
    const cancelacion = new Event('cancel', { cancelable: true });
    dialogo.dispatchEvent(cancelacion);
    expect(cancelacion.defaultPrevented).toBe(true);
    expect(cerrar).toHaveBeenCalledOnce();
    expect(dialogo.open).toBe(false);
    expect(document.activeElement).toBe(origen);
  });

  it('restores focus and scrolling when the component is destroyed directly', async () => {
    await crear();
    fixture.destroy();
    expect(document.activeElement).toBe(origen);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('renders untrusted reasons as text and gives evidence a protected external link', async () => {
    const dialogo = await crear({
      ...DETALLES_DEMO[2],
      motivo_cliente: '<img src=x onerror=alert(1)>',
    });
    expect(dialogo.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(dialogo.querySelector('img')).toBeNull();
    const enlace = dialogo.querySelector('a')!;
    expect(enlace.getAttribute('target')).toBe('_blank');
    expect(enlace.getAttribute('rel')).toContain('noopener');
    expect(enlace.getAttribute('rel')).toContain('noreferrer');
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'no-es-url',
    'blob:https://otro.example.test/archivo',
  ])('does not link unsafe evidence: %s', async (url) => {
    const dialogo = await crear({ ...DETALLES_DEMO[0], evidencia: { nombre: 'archivo.pdf', url } });
    expect(dialogo.querySelector('a')).toBeNull();
    expect(dialogo.textContent).toContain('El enlace de evidencia no está disponible.');
  });
});
