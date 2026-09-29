import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CuentaApi } from '../../services/cuenta-api';
import { SolicitudReembolso } from '../../models/solicitud-reembolso.model';
import { ToastService } from '../../../../shared/ui/toast/toast-service';
import { UiButton } from '../../../../shared/ui';
import { CuentaReembolsoBadge } from '../../components/cuenta-reembolso-badge/cuenta-reembolso-badge';
import { CuentaSolicitudModal } from '../../components/cuenta-solicitud-modal/cuenta-solicitud-modal';
import { CuentaTicketModal } from '../../components/cuenta-ticket-modal/cuenta-ticket-modal';

/** "Mis Solicitudes" de reembolso: listado + crear + ver detalle. Hija de cuenta-layout. */
@Component({
  selector: 'app-cuenta-solicitudes',
  imports: [CuentaReembolsoBadge, CuentaSolicitudModal, CuentaTicketModal, UiButton],
  host: { class: 'block' },
  templateUrl: './cuenta-solicitudes.html',
})
export class CuentaSolicitudes {
  protected readonly api = inject(CuentaApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly modalAbierto = signal(false);
  protected readonly preseleccionado = signal<string | undefined>(undefined);
  protected readonly detalle = signal<SolicitudReembolso | null>(null);

  constructor() {
    // Se llega aquí desde "Solicitar reembolso" en Mis Pedidos con ?nueva=1&pedido=ID.
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    if (params.get('nueva') === '1') {
      this.preseleccionado.set(params.get('pedido') ?? undefined);
      this.modalAbierto.set(true);
      this.router.navigate(['/mi-cuenta/solicitudes'], { replaceUrl: true });
    }
  }

  protected abrirNueva(): void {
    this.preseleccionado.set(undefined);
    this.modalAbierto.set(true);
  }

  protected crear(data: Omit<SolicitudReembolso, 'id' | 'date' | 'status'>): void {
    const solicitud = this.api.crearSolicitud(data);
    this.toast.success(
      'Solicitud enviada',
      `Tu solicitud #${solicitud.id} fue registrada. Responderemos en 2–5 días hábiles.`,
    );
  }

  /** Clases del borde y del ícono según el estado del ticket. */
  protected tono(status: string): { card: string; icon: string } {
    if (status === 'approved') return { card: 'border-[#bbf7d0]', icon: 'bg-success-50 text-success-700' };
    if (status === 'rejected') return { card: 'border-[#fca5a5]', icon: 'bg-[#fee2e2] text-brand-600' };
    return { card: 'border-[#fde68a]', icon: 'bg-[#fefce8] text-[#a16207]' };
  }
}
