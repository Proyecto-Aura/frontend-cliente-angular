import { SolicitudVista } from '../models/solicitud-vista.model';
import { SolicitudDetalle } from '../models/solicitud-detalle.model';
import { PedidoReembolsoVista } from '../models/solicitud-formulario.model';

/** Ejemplos exclusivos de pruebas y vista previa de desarrollo. No son registros del cliente. */
export const SOLICITUDES_DEMO: readonly SolicitudVista[] = [
  {
    id: 1,
    codigo: 'SOL-DEMO-001',
    pedido: { id: 101, codigo: 'PED-DEMO-001' },
    estado: 'pendiente',
    monto: 10.4,
    fecha_solicitud: '2026-10-12T12:00:00Z',
    motivo: 'Producto incorrecto',
    descripcion: 'El producto recibido no corresponde al pedido realizado.',
  },
  {
    id: 2,
    codigo: 'SOL-DEMO-002',
    pedido: { id: 102, codigo: 'PED-DEMO-002' },
    estado: 'aprobado',
    monto: 3.5,
    fecha_solicitud: '2026-10-08T12:00:00Z',
    motivo: 'Producto llegó dañado',
    descripcion: 'La bolsa llegó rota y el producto estaba derramado.',
  },
  {
    id: 3,
    codigo: 'SOL-DEMO-003',
    pedido: { id: 103, codigo: 'PED-DEMO-003' },
    estado: 'rechazado',
    monto: 19.9,
    fecha_solicitud: '2026-10-02T12:00:00Z',
    motivo: 'Producto incorrecto',
    descripcion: 'Pedí maní tostado salado pero me enviaron confitado.',
  },
  {
    id: 4,
    codigo: 'SOL-DEMO-004',
    pedido: { id: 104, codigo: 'PED-DEMO-004' },
    estado: 'reembolsado',
    monto: 6.9,
    fecha_solicitud: '2026-09-20T12:00:00Z',
    motivo: 'Producto en mal estado',
    descripcion: 'El producto venció antes de la fecha indicada en el empaque.',
  },
];

/** Fixtures con los campos reales del detalle, sin producto ni método de devolución. */
export const DETALLES_DEMO: readonly SolicitudDetalle[] = SOLICITUDES_DEMO.map(
  ({ motivo, descripcion, ...solicitud }) => ({
    ...solicitud,
    motivo_cliente: `${motivo}: ${descripcion}`,
    fecha_resolucion: {
      pendiente: null,
      aprobado: '2026-10-09T12:00:00Z',
      rechazado: '2026-10-04T12:00:00Z',
      reembolsado: '2026-09-21T12:00:00Z',
    }[solicitud.estado],
    motivo_rechazo:
      solicitud.estado === 'rechazado'
        ? 'El producto entregado coincide con el pedido registrado.'
        : null,
    evidencia:
      solicitud.estado === 'aprobado'
        ? null
        : {
            nombre: 'evidencia-demostracion.pdf',
            // Solo fixture. La vista previa sustituye esta URL por un PDF Blob local.
            url: 'https://example.test/evidencia-demostracion.pdf',
          },
  }),
);

/** Pedidos ficticios distintos de las solicitudes de ejemplo; solo para formulario y pruebas. */
export const PEDIDOS_FORM_DEMO: readonly PedidoReembolsoVista[] = [
  {
    id: 501,
    codigo: 'PED-FORM-DEMO-001',
    fecha: '2026-10-12T12:00:00Z',
    estado: 'confirmado',
    pagado: true,
    tieneSolicitud: false,
    montoPagado: 10.4,
  },
  {
    id: 502,
    codigo: 'PED-FORM-DEMO-002',
    fecha: '2026-10-10T12:00:00Z',
    estado: 'entregado',
    pagado: true,
    tieneSolicitud: false,
    montoPagado: 19.9,
  },
  {
    id: 503,
    codigo: 'PED-FORM-DEMO-003',
    fecha: '2026-10-05T12:00:00Z',
    estado: 'cancelado',
    pagado: true,
    tieneSolicitud: false,
    montoPagado: 6.9,
  },
  {
    id: 504,
    codigo: 'NO-ELEGIBLE-EN-CAMINO',
    fecha: '2026-10-05T12:00:00Z',
    estado: 'en_camino',
    pagado: true,
    tieneSolicitud: false,
    montoPagado: 6.9,
  },
  {
    id: 505,
    codigo: 'NO-ELEGIBLE-SIN-PAGO',
    fecha: '2026-10-05T12:00:00Z',
    estado: 'confirmado',
    pagado: false,
    tieneSolicitud: false,
    montoPagado: 0,
  },
  {
    id: 506,
    codigo: 'NO-ELEGIBLE-DUPLICADO',
    fecha: '2026-10-05T12:00:00Z',
    estado: 'entregado',
    pagado: true,
    tieneSolicitud: true,
    montoPagado: 6.9,
  },
];
