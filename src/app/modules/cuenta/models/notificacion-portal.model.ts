/** Contrato de GET /portal/notificaciones; referencias no son URLs. */
export interface NotificacionPortal {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  referencia_id: string | null;
  referencia_tipo: string | null;
  leido: boolean;
  fecha_leido: string | null;
  created_at: string;
}

export interface PaginaNotificaciones {
  data: NotificacionPortal[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}

/** Solo abre el detalle propio publicado, nunca un enlace recibido en el mensaje. */
export function reembolsoDeNotificacion(notificacion: NotificacionPortal): number | null {
  if (
    notificacion.referencia_tipo !== 'reembolso' ||
    !/^[1-9]\d*$/.test(notificacion.referencia_id ?? '')
  )
    return null;
  const id = Number(notificacion.referencia_id);
  return Number.isSafeInteger(id) ? id : null;
}
