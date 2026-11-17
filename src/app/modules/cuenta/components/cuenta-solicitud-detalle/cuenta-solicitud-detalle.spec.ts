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
    expect(dialogo.textContent).toContain(solicitud.motivo);
    expect(dialogo.textContent).toContain(solicitud.descripcion);
    expect(dialogo.textContent).not.toContain(solicitud.motivo_cliente);
    const etiquetasEstado = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      reembolsado: 'Reembolsado',
    };
    const esperado = etiquetasEstado[solicitud.estado];
    expect(dialogo.querySelector('app-cuenta-solicitud-estado')?.textContent?.trim()).toBe(
      esperado,
    );
    expect(
      [...dialogo.querySelectorAll('ol li p:first-child')].map((p) => p.textContent?.trim()),
    ).toEqual(
      solicitud.estado === 'pendiente'
        ? ['Solicitud registrada', 'En revisión']
        : solicitud.estado === 'rechazado'
          ? ['Solicitud registrada', 'Rechazada']
          : solicitud.estado === 'aprobado'
            ? ['Solicitud registrada', 'Aprobada']
            : ['Solicitud registrada', 'Aprobada', 'Reembolsada'],
    );
    const etiquetas = [...dialogo.querySelectorAll('dt')].map((e) => e.textContent?.trim());
    expect(etiquetas).not.toContain('Fecha de resolución');
    expect(etiquetas.includes('Motivo del rechazo')).toBe(solicitud.estado === 'rechazado');
    expect(etiquetas.includes('Evidencia')).toBe(!!solicitud.evidencia);
    expect(etiquetas.slice(0, 6)).toEqual([
      'Tipo',
      'Pedido',
      'Producto',
      'Fecha de solicitud',
      'Importe',
      'Descripción',
    ]);
    expect(dialogo.querySelectorAll('dd')[2].textContent?.trim()).toBe('Pedido completo');
    expect(etiquetas).not.toContain('Método de devolución');
    expect(dialogo.querySelectorAll('ol li')).toHaveLength(
      solicitud.estado === 'reembolsado' ? 3 : 2,
    );
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
      motivo: '<img src=x onerror=alert(1)>',
      descripcion: '<script>alert(2)</script>',
      motivo_rechazo: '<svg onload=alert(3)>',
    });
    expect(dialogo.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(dialogo.textContent).toContain('<script>alert(2)</script>');
    expect(dialogo.textContent).toContain('<svg onload=alert(3)>');
    expect(dialogo.querySelector('img, script, dd svg')).toBeNull();
    const enlace = dialogo.querySelector('a')!;
    expect(enlace.getAttribute('target')).toBe('_blank');
    expect(enlace.getAttribute('rel')).toContain('noopener');
    expect(enlace.getAttribute('rel')).toContain('noreferrer');
  });

  it('uses each published timestamp for its own timeline event', async () => {
    const solicitud = {
      ...DETALLES_DEMO[3],
      fecha_solicitud: '2026-10-01T12:00:00Z',
      fecha_resolucion: '2026-10-02T12:00:00Z',
      fecha_reembolso: '2026-10-03T12:00:00Z',
    };
    const dialogo = await crear(solicitud);
    const fechas = [...dialogo.querySelectorAll('ol time')];
    expect(fechas.map((t) => t.getAttribute('datetime'))).toEqual([
      solicitud.fecha_solicitud,
      solicitud.fecha_resolucion,
      solicitud.fecha_reembolso,
    ]);
    expect(fechas.map((t) => t.textContent?.trim())).toEqual([
      '1 Oct, 2026',
      '2 Oct, 2026',
      '3 Oct, 2026',
    ]);
  });

  it.each(['aprobado', 'rechazado'] as const)(
    'dates the %s resolution from fecha_resolucion',
    async (estado) => {
      const dialogo = await crear({
        ...DETALLES_DEMO[0],
        estado,
        fecha_resolucion: '2026-10-14T12:00:00Z',
      });
      expect(dialogo.querySelector('ol li:last-child time')?.getAttribute('datetime')).toBe(
        '2026-10-14T12:00:00Z',
      );
      expect(dialogo.querySelector('ol li:last-child time')?.textContent?.trim()).toBe(
        '14 Oct, 2026',
      );
      expect(dialogo.querySelectorAll('ol li')).toHaveLength(2);
    },
  );

  it('keeps historical stages without inventing dates from state or updated_at', async () => {
    const dialogo = await crear({
      ...DETALLES_DEMO[3],
      fecha_resolucion: null,
      fecha_reembolso: null,
    });
    expect(dialogo.querySelectorAll('ol li')).toHaveLength(3);
    expect(dialogo.querySelectorAll('ol time')).toHaveLength(1);
    expect(dialogo.querySelector('ol li:last-child')?.textContent?.trim()).toBe('Reembolsada');
    expect(dialogo.textContent).not.toMatch(/Invalid Date|null|undefined/);
  });

  it('shows a pending review indicator without inventing an approval or its date', async () => {
    const dialogo = await crear();
    expect(dialogo.querySelectorAll('ol time')).toHaveLength(1);
    expect(dialogo.querySelector('ol li:last-child')?.textContent).toContain(
      'Pendiente de respuesta',
    );
    expect(dialogo.querySelector('ol')?.textContent).not.toMatch(/Aprobada|Rechazada|Reembolsada/);
  });

  it('omits unavailable historical texts instead of splitting motivo_cliente', async () => {
    const dialogo = await crear({
      ...DETALLES_DEMO[0],
      motivo: null,
      descripcion: null,
      evidencia: null,
      motivo_cliente: 'Texto: histórico: ambiguo',
    });
    expect(dialogo.textContent).not.toContain('Texto: histórico: ambiguo');
    expect(dialogo.textContent).not.toMatch(/Solicitud de reembolso|null|undefined/);
    expect([...dialogo.querySelectorAll('dt')].map((dt) => dt.textContent?.trim())).toEqual([
      'Tipo',
      'Pedido',
      'Producto',
      'Fecha de solicitud',
      'Importe',
    ]);
    expect(dialogo.querySelector('a')).toBeNull();
  });

  it('does not split a reason that contains a colon or show rejection data for an approved request', async () => {
    const dialogo = await crear({
      ...DETALLES_DEMO[1],
      motivo: 'Otro: cierre del empaque',
      motivo_rechazo: 'Dato que no corresponde al estado.',
    });
    expect(dialogo.textContent).toContain('Otro: cierre del empaque');
    expect(dialogo.textContent).not.toContain('Dato que no corresponde al estado.');
    expect(dialogo.querySelector('a')).toBeNull();
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
