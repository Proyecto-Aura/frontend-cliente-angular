import {
  Component,
  afterRenderEffect,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, disabled, form, required, validate } from '@angular/forms/signals';

import { Icon } from '../../../../shared/ui/icon/icon';
import { CuentaDialogo } from '../cuenta-dialogo/cuenta-dialogo';
import {
  LIMITE_EVIDENCIA_BYTES,
  MOTIVOS_SOLICITUD,
  PedidoReembolsoVista,
  SolicitudPreparada,
  TIPOS_EVIDENCIA,
  esPedidoElegible,
} from '../../models/solicitud-formulario.model';

const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const fecha = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

@Component({
  imports: [FormField, Icon, CuentaDialogo],
  selector: 'app-cuenta-solicitud-formulario',
  templateUrl: './cuenta-solicitud-formulario.html',
})
export class CuentaSolicitudFormulario {
  readonly pedidos = input<readonly PedidoReembolsoVista[]>([]);
  readonly demostracion = input(false);
  readonly enviando = input(false);
  readonly errorEnvio = input<string | null>(null);
  readonly envioDisponible = input(true);
  readonly pedidoInicialId = input<number | null>(null);
  readonly cargandoPedidos = input(false);
  readonly errorPedidos = input<string | null>(null);
  readonly detalleIncompleto = input(false);
  readonly paginaPedidos = input(1);
  readonly totalPaginasPedidos = input(0);
  readonly cambiarPaginaPedidos = output<number>();
  readonly reintentarPedidos = output<void>();
  readonly cerrar = output<void>();
  readonly validado = output<SolicitudPreparada>();

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly selectorArchivo = viewChild<ElementRef<HTMLInputElement>>('selectorArchivo');
  private readonly errorEnvioNodo = viewChild<ElementRef<HTMLElement>>('errorEnvioNodo');
  private readonly estadoEnvioNodo = viewChild<ElementRef<HTMLElement>>('estadoEnvioNodo');
  protected readonly motivos = MOTIVOS_SOLICITUD;
  protected readonly intentado = signal(false);
  protected readonly archivoRevisado = signal(false);
  protected readonly validacionCompleta = signal(false);
  protected readonly archivos = signal<readonly File[]>([]);
  protected readonly elegibles = computed(() => this.pedidos().filter(esPedidoElegible));
  protected readonly modelo = linkedSignal(() => ({
    pedido_id: String(
      (this.pedidoInicialId() === null
        ? this.elegibles()[0]?.id
        : this.elegibles().find((p) => p.id === this.pedidoInicialId())?.id) ?? '',
    ),
    motivo: '',
    descripcion: '',
  }));
  protected readonly seleccionado = computed(() =>
    this.elegibles().find((p) => String(p.id) === this.modelo().pedido_id),
  );
  protected readonly importe = computed(() => this.seleccionado()?.montoPagado.toFixed(2) ?? '');
  protected readonly archivo = computed(() => this.archivos()[0]);

  protected readonly formulario = form(this.modelo, (s) => {
    required(s.pedido_id, { message: 'Selecciona un pedido pagado.' });
    validate(s.pedido_id, ({ value }) =>
      value() && !this.elegibles().some((p) => String(p.id) === value())
        ? { kind: 'pedido', message: 'Selecciona un pedido elegible para reembolso.' }
        : undefined,
    );
    required(s.motivo, { message: 'Selecciona un motivo.' });
    validate(s.motivo, ({ value }) =>
      !value().trim()
        ? { kind: 'motivo', message: 'Selecciona un motivo.' }
        : value().trim().length > 150
          ? { kind: 'maxLength', message: 'El motivo no puede superar 150 caracteres.' }
          : undefined,
    );
    required(s.descripcion, { message: 'Describe el problema (mínimo 10 caracteres).' });
    validate(s.descripcion, ({ value }) => {
      const longitud = value().trim().length;
      return longitud < 10
        ? { kind: 'minLength', message: 'Describe el problema (mínimo 10 caracteres).' }
        : longitud > 1000
          ? { kind: 'maxLength', message: 'La descripción no puede superar 1000 caracteres.' }
          : undefined;
    });
    disabled(s, {
      when: () => this.enviando() || this.cargandoPedidos() || this.errorPedidos() !== null,
    });
  });

  protected readonly errorArchivo = computed(() => {
    const archivo = this.archivo();
    if (!archivo) return 'Adjunta una imagen o PDF como evidencia.';
    if (!TIPOS_EVIDENCIA.includes(archivo.type)) return 'Adjunta un archivo PDF, JPG, PNG o WEBP.';
    if (!archivo.size) return 'El archivo está vacío. Selecciona otra evidencia.';
    if (archivo.size >= LIMITE_EVIDENCIA_BYTES)
      return 'La evidencia debe pesar menos de 5 MB (5 MiB).';
    return null;
  });

  constructor() {
    afterRenderEffect({
      write: () => {
        const destino = this.enviando()
          ? this.estadoEnvioNodo()
          : this.errorEnvio()
            ? this.errorEnvioNodo()
            : undefined;
        destino?.nativeElement.focus();
      },
    });
  }

  protected errorCampo(campo: 'pedido_id' | 'motivo' | 'descripcion'): string | null {
    const estado = this.formulario[campo]();
    return this.intentado() || estado.touched() ? (estado.errors()[0]?.message ?? null) : null;
  }

  protected etiquetaPedido(pedido: PedidoReembolsoVista): string {
    const partes = fecha.formatToParts(new Date(pedido.fecha));
    const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
      partes.find((p) => p.type === tipo)?.value ?? '';
    const mes = valor('month').replace('.', '');
    const dia = `${valor('day')} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}, ${valor('year')}`;
    return `#${pedido.codigo} · ${dia} · ${moneda.format(pedido.montoPagado)}`;
  }

  protected elegirArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivos.set(Array.from(input.files ?? []));
    this.archivoRevisado.set(true);
    this.validacionCompleta.set(false);
  }

  protected quitarArchivo(): void {
    this.archivos.set([]);
    this.archivoRevisado.set(true);
    this.validacionCompleta.set(false);
    const input = this.selectorArchivo()?.nativeElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  protected enviar(event: Event): void {
    event.preventDefault();
    if (
      !this.envioDisponible() ||
      this.enviando() ||
      this.cargandoPedidos() ||
      this.errorPedidos() ||
      !this.elegibles().length ||
      (this.demostracion() && this.validacionCompleta())
    )
      return;
    this.intentado.set(true);
    this.validacionCompleta.set(false);
    const campo = (['pedido_id', 'motivo', 'descripcion'] as const).find((c) =>
      this.formulario[c]().invalid(),
    );
    if (campo) {
      this.elemento.nativeElement.querySelector<HTMLElement>(`#solicitud-${campo}`)?.focus();
      return;
    }
    if (this.errorArchivo()) {
      this.selectorArchivo()?.nativeElement.focus();
      return;
    }
    const pedido = this.seleccionado();
    const archivo = this.archivo();
    if (!pedido || !archivo) return;
    this.validacionCompleta.set(true);
    this.validado.emit({
      pedido_id: pedido.id,
      motivo: this.modelo().motivo.trim(),
      descripcion: this.modelo().descripcion.trim(),
      evidencia: archivo,
    });
  }
}
