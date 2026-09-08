import { Component, computed, input, output } from '@angular/core';

import { EstadoSolicitud, SolicitudReembolso } from '../../models/solicitud-reembolso.model';

const MENSAJES: Record<EstadoSolicitud, { title: string; desc: string; tone: string }> = {
  pending: {
    title: 'En revisión',
    desc: 'Tu solicitud está siendo evaluada por nuestro equipo. Te notificaremos en 2–5 días hábiles.',
    tone: 'border-[#fde68a] bg-[#fefce8] text-[#a16207]',
  },
  approved: {
    title: 'Reembolso aprobado',
    desc: 'Tu reembolso fue aprobado. El monto será devuelto al método de pago original en 3–5 días hábiles.',
    tone: 'border-[#bbf7d0] bg-success-50 text-success-700',
  },
  rejected: {
    title: 'Solicitud rechazada',
    desc: 'Lamentablemente tu solicitud no pudo ser aprobada. Puedes contactarnos para más información.',
    tone: 'border-[#fca5a5] bg-[#fee2e2] text-brand-700',
  },
};

/** Detalle (solo lectura) de una solicitud de reembolso. */
@Component({
  selector: 'app-cuenta-ticket-modal',
  host: { class: 'block' },
  templateUrl: './cuenta-ticket-modal.html',
})
export class CuentaTicketModal {
  readonly ticket = input.required<SolicitudReembolso>();
  readonly close = output<void>();

  protected readonly info = computed(() => MENSAJES[this.ticket().status]);
  protected readonly campos = computed(() => {
    const t = this.ticket();
    return [
      { label: 'N° Solicitud', value: `#${t.id}` },
      { label: 'Pedido', value: `#${t.orderId} — ${t.orderSummary}` },
      { label: 'Monto a reembolsar', value: `S/ ${t.orderTotal.toFixed(2)}` },
      { label: 'Motivo', value: t.motivo },
      { label: 'Fecha', value: t.date },
    ];
  });
}
