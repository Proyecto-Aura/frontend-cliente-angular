import { SolicitudDetalle } from '../models/solicitud-detalle.model';

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
