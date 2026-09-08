import { Injectable, signal } from '@angular/core';

import { Direccion } from '../models/direccion.model';
import { Pedido } from '../models/pedido.model';
import { SolicitudReembolso } from '../models/solicitud-reembolso.model';
import {
  DIRECCIONES_MOCK,
  MOTIVOS_REEMBOLSO,
  PEDIDOS_MOCK,
  SOLICITUDES_MOCK,
} from './cuenta.mock';

/**
 * Acceso a datos de "Mi cuenta". Hoy sirve la data de ejemplo del prototipo y
 * guarda los cambios en memoria (signals). Se conecta a los endpoints reales
 * cuando existan (GET/PATCH /pedidos, /direcciones, /solicitudes).
 */
@Injectable({ providedIn: 'root' })
export class CuentaApi {
  readonly motivosReembolso = MOTIVOS_REEMBOLSO;

  private readonly _pedidos = signal<Pedido[]>(PEDIDOS_MOCK);
  private readonly _direcciones = signal<Direccion[]>(DIRECCIONES_MOCK);
  private readonly _solicitudes = signal<SolicitudReembolso[]>(SOLICITUDES_MOCK);

  readonly pedidos = this._pedidos.asReadonly();
  readonly direcciones = this._direcciones.asReadonly();
  readonly solicitudes = this._solicitudes.asReadonly();

  // --- Direcciones ---

  agregarDireccion(data: Omit<Direccion, 'id' | 'predeterminada'>): void {
    this._direcciones.update((list) => [
      ...list,
      { ...data, id: `addr-${Date.now()}`, predeterminada: list.length === 0 },
    ]);
  }

  editarDireccion(id: string, data: Omit<Direccion, 'id' | 'predeterminada'>): void {
    this._direcciones.update((list) => list.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }

  eliminarDireccion(id: string): void {
    this._direcciones.update((list) => list.filter((a) => a.id !== id));
  }

  marcarPredeterminada(id: string): void {
    this._direcciones.update((list) => list.map((a) => ({ ...a, predeterminada: a.id === id })));
  }

  // --- Solicitudes ---

  crearSolicitud(data: Omit<SolicitudReembolso, 'id' | 'date' | 'status'>): SolicitudReembolso {
    const solicitud: SolicitudReembolso = {
      ...data,
      id: `SOL-${String(this._solicitudes().length + 3).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'pending',
    };
    this._solicitudes.update((list) => [solicitud, ...list]);
    return solicitud;
  }
}
