// Datos de ejemplo migrados del prototipo (portal React). Se reemplazan por
// los endpoints reales (GET /pedidos, GET /direcciones, GET /solicitudes).

import { Direccion } from '../models/direccion.model';
import { Pedido } from '../models/pedido.model';
import { SolicitudReembolso } from '../models/solicitud-reembolso.model';

export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 'FRS-4582',
    date: '12 Oct, 2026',
    payment: 'pending',
    delivery: 'processing',
    thumbs: ['/productos/garbanzo-frita-salado.png', '/productos/arveja-frita-salada.png'],
    summary: 'Garbanzo Frita y 2 más',
    total: 9.4,
    items: 2,
  },
  {
    id: 'FRS-4583',
    date: '10 Oct, 2026',
    payment: 'paid',
    delivery: 'shipping',
    thumbs: ['/productos/chifle-salado.png', '/productos/pedido-extra-1.png'],
    summary: 'Chifle Salado y 2 más',
    total: 25.8,
    items: 3,
  },
  {
    id: 'FRS-4584',
    date: '5 Oct, 2026',
    payment: 'paid',
    delivery: 'delivered',
    thumbs: ['/productos/mani-confitado.png', '/productos/pedido-extra-2.png'],
    summary: 'Maní Confitado y 1 más',
    total: 8.4,
    items: 2,
  },
];

export const DIRECCIONES_MOCK: Direccion[] = [
  {
    id: 'addr-1',
    nombre: 'Casa Miraflores',
    linea1: 'Av. José Larco 1232, Int 402',
    linea2: 'Miraflores, Lima, Perú',
    predeterminada: true,
  },
  {
    id: 'addr-2',
    nombre: 'Oficina San Isidro',
    linea1: 'Calle Las Orquídeas 585, Piso 10',
    linea2: 'San Isidro, Lima, Perú',
    predeterminada: false,
  },
];

export const MOTIVOS_REEMBOLSO = [
  'Producto llegó dañado',
  'Producto incorrecto',
  'Pedido no recibido',
  'Producto en mal estado',
  'No coincide con la descripción',
  'Otro motivo',
];

export const SOLICITUDES_MOCK: SolicitudReembolso[] = [
  {
    id: 'SOL-001',
    date: '8 Oct, 2026',
    orderId: 'FRS-4580',
    orderSummary: 'Chifle Dulce 90g',
    orderTotal: 3.5,
    motivo: 'Producto llegó dañado',
    descripcion: 'La bolsa llegó rota y el producto estaba derramado.',
    status: 'approved',
  },
  {
    id: 'SOL-002',
    date: '2 Oct, 2026',
    orderId: 'FRS-4577',
    orderSummary: 'Maní Tostado Salado 500g',
    orderTotal: 19.9,
    motivo: 'Producto incorrecto',
    descripcion: 'Pedí maní tostado salado pero me enviaron confitado.',
    status: 'rejected',
  },
];
