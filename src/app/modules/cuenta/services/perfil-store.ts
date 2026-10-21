import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Session } from '../../../shared/auth/session';
import { ActualizarPerfil, PerfilCliente } from '../models/perfil.model';

/**
 * Perfil del cliente (HU-B-015): lo usan la barra lateral de "Mi cuenta"
 * (nombre y tipo) y la página "Mi Perfil". Se olvida al cerrar sesión.
 */
@Injectable({ providedIn: 'root' })
export class PerfilStore {
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);
  private readonly url = `${environment.apiUrl}/perfil`;

  private readonly _perfil = signal<PerfilCliente | null>(null);
  readonly perfil = this._perfil.asReadonly();

  /** "Rosa Quispe", o la razón social si es empresa. */
  readonly nombreVisible = computed(() => {
    const p = this._perfil();
    if (!p) return '';
    return p.tipo_cliente === 'empresa' && p.razon_social
      ? p.razon_social
      : `${p.nombres} ${p.apellido_paterno}`.trim();
  });
  readonly iniciales = computed(() => {
    const p = this._perfil();
    return p ? `${p.nombres.charAt(0)}${p.apellido_paterno.charAt(0)}`.toUpperCase() : '';
  });
  readonly tipoVisible = computed(() => {
    const tipo = this._perfil()?.tipo_cliente;
    return tipo === 'empresa' ? 'Empresa' : tipo === 'persona_natural' ? 'Persona natural' : '';
  });

  constructor() {
    effect(() => {
      if (!this.session.isAuthenticated()) this._perfil.set(null);
    });
  }

  cargar(): Observable<PerfilCliente> {
    return this.http.get<PerfilCliente>(this.url).pipe(tap((p) => this._perfil.set(p)));
  }

  actualizar(cambios: ActualizarPerfil): Observable<PerfilCliente> {
    return this.http.patch<PerfilCliente>(this.url, cambios).pipe(tap((p) => this._perfil.set(p)));
  }
}
