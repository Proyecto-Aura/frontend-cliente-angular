import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  afterNextRender,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { SolicitudDetalle } from '../../models/solicitud-detalle.model';
import { SolicitudPreparada, esPedidoElegible } from '../../models/solicitud-formulario.model';
import { errorEnvioReembolso } from '../../models/error-envio-reembolso';
import { ReembolsosApi } from '../../services/reembolsos-api';
import { PedidosStore } from '../../services/pedidos-store';
import { CuentaSolicitudFormulario } from '../cuenta-solicitud-formulario/cuenta-solicitud-formulario';

@Component({
  imports: [CuentaSolicitudFormulario],
  providers: [PedidosStore],
  selector: 'app-cuenta-nueva-solicitud',
  templateUrl: './cuenta-nueva-solicitud.html',
})
export class CuentaNuevaSolicitud {
  readonly pedidoInicialId = input<number | null>(null);
  readonly paginaInicial = input(1);
  readonly cerrar = output<void>();
  readonly registrada = output<SolicitudDetalle>();
  readonly revisarPedidos = output<void>();
  protected readonly pedidos = inject(PedidosStore);
  protected readonly enviando = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);
  protected readonly requiereRevision = signal(false);
  private readonly api = inject(ReembolsosApi);
  private readonly avisos = inject(Avisos);
  private readonly destroyRef = inject(DestroyRef);
  private guardada = false;

  constructor() {
    afterNextRender(() => this.pedidos.cargar(this.paginaInicial()));
  }

  protected enviar(solicitud: SolicitudPreparada): void {
    if (this.enviando() || this.guardada || this.requiereRevision()) return;
    if (!this.pedidos.opciones().some((p) => p.id === solicitud.pedido_id && esPedidoElegible(p))) {
      this.errorEnvio.set('Selecciona un pedido pagado que admita reembolsos.');
      return;
    }
    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.api
      .solicitar(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.guardada = true;
          this.enviando.set(false);
          this.avisos.mostrar(
            `Solicitud ${respuesta.codigo} registrada`,
            'Estado: Pendiente de aprobación.',
          );
          this.registrada.emit(respuesta);
        },
        error: (error: unknown) => {
          const resultado = errorEnvioReembolso(error);
          this.errorEnvio.set(resultado.mensaje);
          this.requiereRevision.set(resultado.requiereRevision);
          this.enviando.set(false);
        },
      });
  }

  protected cerrarFormulario(): void {
    if (this.enviando()) return;
    if (this.requiereRevision()) this.revisarPedidos.emit();
    this.cerrar.emit();
  }
}
