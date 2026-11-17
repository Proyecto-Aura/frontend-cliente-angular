import { NotificacionPortal, PaginaNotificaciones } from '../models/notificacion-portal.model';

/** Fixtures exclusivas de pruebas; nunca se importan desde la aplicación. */
export const NOTIFICACION_APROBADA: NotificacionPortal = {
  id: 51,
  tipo: 'reembolso_aprobado',
  titulo: 'Solicitud de reembolso aprobada',
  mensaje: 'PRUEBA: Tu solicitud REF-PRUEBA-001 fue aprobada.',
  referencia_id: '31',
  referencia_tipo: 'reembolso',
  leido: false,
  fecha_leido: null,
  created_at: '2026-11-06T02:00:00.000Z',
};
export const NOTIFICACION_RECHAZADA: NotificacionPortal = {
  ...NOTIFICACION_APROBADA,
  id: 52,
  tipo: 'reembolso_rechazado',
  titulo: 'Solicitud de reembolso rechazada',
  mensaje: 'PRUEBA: Solicitud rechazada. Motivo: evidencia no legible.',
  referencia_id: '32',
};
export const PAGINA_NOTIFICACIONES: PaginaNotificaciones = {
  data: [NOTIFICACION_APROBADA, NOTIFICACION_RECHAZADA],
  meta: { total: 2, page: 1, limit: 10, total_pages: 1 },
};
