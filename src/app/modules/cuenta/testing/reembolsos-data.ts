import { SolicitudDetalle } from '../models/solicitud-detalle.model';
import { PaginaSolicitudes, SolicitudResumen } from '../models/solicitud-portal.model';

/** Respuesta ficticia exclusiva de pruebas unitarias; nunca se inserta en la página real. */
export const SOLICITUD_REGISTRADA_PRUEBA: SolicitudDetalle = {
  id: 31,
  codigo: 'REF-PRUEBA-001',
  pedido: { id: 21, codigo: 'PED-PRUEBA-021' },
  monto: 12,
  estado: 'pendiente',
  fecha_solicitud: '2026-11-06T12:00:00Z',
  fecha_resolucion: null,
  motivo_cliente: 'Otro: Evidencia exclusiva de pruebas locales.',
  motivo_rechazo: null,
  evidencia: null,
};

export const SOLICITUD_RESUMEN_PRUEBA: SolicitudResumen = {
  id: SOLICITUD_REGISTRADA_PRUEBA.id,
  codigo: SOLICITUD_REGISTRADA_PRUEBA.codigo,
  pedido: SOLICITUD_REGISTRADA_PRUEBA.pedido,
  monto: SOLICITUD_REGISTRADA_PRUEBA.monto,
  estado: SOLICITUD_REGISTRADA_PRUEBA.estado,
  fecha_solicitud: SOLICITUD_REGISTRADA_PRUEBA.fecha_solicitud,
  fecha_resolucion: SOLICITUD_REGISTRADA_PRUEBA.fecha_resolucion,
};

export const PAGINA_SOLICITUDES_PRUEBA: PaginaSolicitudes = {
  data: [SOLICITUD_RESUMEN_PRUEBA],
  meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
};
