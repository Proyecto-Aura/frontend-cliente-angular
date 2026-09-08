import { Component, inject, signal } from '@angular/core';

import { CuentaApi } from '../../services/cuenta-api';
import { Direccion } from '../../models/direccion.model';
import { ToastService } from '../../../../shared/ui/toast/toast-service';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { CuentaDireccionModal } from '../../components/cuenta-direccion-modal/cuenta-direccion-modal';
import { CuentaEmailCard } from '../../components/cuenta-email-card/cuenta-email-card';
import { CuentaPasswordCard } from '../../components/cuenta-password-card/cuenta-password-card';

/** "Mi Perfil": datos personales, direcciones, correo y contraseña. Hija de cuenta-layout. */
@Component({
  selector: 'app-cuenta-perfil',
  imports: [ConfirmDialog, CuentaDireccionModal, CuentaEmailCard, CuentaPasswordCard],
  host: { class: 'block' },
  templateUrl: './cuenta-perfil.html',
})
export class CuentaPerfil {
  protected readonly api = inject(CuentaApi);
  private readonly toast = inject(ToastService);

  // TODO: usuario real desde shared/auth cuando exista sesión con perfil.
  protected readonly nombre = signal('Juan');
  protected readonly apellido = signal('Pérez');
  protected readonly email = signal('franco@gmail.com');
  protected readonly telefono = signal('+51 999999999');
  protected readonly guardado = signal(false);

  protected readonly modalAbierto = signal(false);
  protected readonly editando = signal<Direccion | null>(null);
  protected readonly confirmEliminarId = signal<string | null>(null);

  protected set(sig: { set(v: string): void }, ev: Event): void {
    sig.set((ev.target as HTMLInputElement).value);
  }

  protected guardarPerfil(): void {
    this.guardado.set(true);
    this.toast.success('Cambios guardados', 'Tu perfil fue actualizado correctamente.');
    setTimeout(() => this.guardado.set(false), 2000);
  }

  protected abrirNueva(): void {
    this.editando.set(null);
    this.modalAbierto.set(true);
  }

  protected abrirEdicion(addr: Direccion): void {
    this.editando.set(addr);
    this.modalAbierto.set(true);
  }

  protected cerrarModal(): void {
    this.modalAbierto.set(false);
    this.editando.set(null);
  }

  protected guardarDireccion(data: Pick<Direccion, 'nombre' | 'linea1' | 'linea2'>): void {
    const editando = this.editando();
    if (editando) {
      this.api.editarDireccion(editando.id, data);
      this.toast.success('Dirección actualizada');
    } else {
      this.api.agregarDireccion(data);
      this.toast.success('Dirección agregada');
    }
    this.cerrarModal();
  }

  protected eliminarDireccion(): void {
    const id = this.confirmEliminarId();
    if (!id) return;
    this.api.eliminarDireccion(id);
    this.toast.success('Dirección eliminada');
    this.confirmEliminarId.set(null);
  }
}
