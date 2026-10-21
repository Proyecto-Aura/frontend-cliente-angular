import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Icon } from '../../../../shared/ui/icon/icon';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { ActualizarPerfil, PerfilCliente } from '../../models/perfil.model';
import { PerfilStore } from '../../services/perfil-store';

/** 9 dígitos; vacío solo si el cliente aún no tenía teléfono. */
function telefonoValido(control: AbstractControl<string>): ValidationErrors | null {
  const valor = control.value.trim();
  if (!valor) return null;
  return /^\d{9}$/.test(valor) ? null : { telefono: true };
}

/**
 * HU-B-015 (RF-B43): "Mi Perfil", donde el cliente edita su nombre, email y
 * teléfono. El email se guarda directo; verificarlo es la HU-B-016.
 */
@Component({
  selector: 'app-cuenta-perfil',
  imports: [ReactiveFormsModule, Icon],
  host: { class: 'flex flex-col gap-[18px]' },
  templateUrl: './cuenta-perfil.html',
})
export class CuentaPerfil {
  private readonly store = inject(PerfilStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup({
    nombres: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(150)],
    }),
    telefono: new FormControl('', { nonNullable: true, validators: [telefonoValido] }),
  });

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorGuardar = signal<string | null>(null);
  protected readonly guardado = signal(false);
  /** El backend avisa que el correo ya es de otra cuenta (409). */
  protected readonly correoEnUso = signal<string | null>(null);

  private original: PerfilCliente | null = null;

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.store
      .cargar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.llenar(perfil);
          this.cargando.set(false);
        },
        error: (err: unknown) => {
          this.errorCarga.set(apiErrorMessage(err, 'No pudimos cargar tu perfil.'));
          this.cargando.set(false);
        },
      });
  }

  protected descartar(): void {
    if (this.original) this.llenar(this.original);
  }

  protected guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.form.dirty || this.guardando()) return;

    const cambios = this.cambios();
    this.guardando.set(true);
    this.guardado.set(false);
    this.errorGuardar.set(null);
    this.correoEnUso.set(null);
    this.store
      .actualizar(cambios)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.guardando.set(false);
          this.llenar(perfil);
          this.guardado.set(true);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          const mensaje = apiErrorMessage(err, 'No pudimos guardar tus datos. Inténtalo de nuevo.');
          if (err instanceof HttpErrorResponse && err.status === 409) {
            this.correoEnUso.set(mensaje);
          } else {
            this.errorGuardar.set(mensaje);
          }
        },
      });
  }

  /** Mensaje del campo si ya se tocó y no es válido. */
  protected error(campo: 'nombres' | 'email' | 'telefono'): string | null {
    const control = this.form.controls[campo];
    if (campo === 'email' && this.correoEnUso()) return this.correoEnUso();
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) {
      return campo === 'nombres' ? 'Ingresa tu nombre' : 'Ingresa tu correo electrónico';
    }
    if (control.hasError('maxlength')) return 'Es demasiado largo';
    if (control.hasError('email')) return 'Ingresa un correo electrónico válido';
    if (control.hasError('telefono')) return 'El teléfono debe tener 9 dígitos';
    return null;
  }

  protected limpiarCorreoEnUso(): void {
    this.correoEnUso.set(null);
  }

  private llenar(perfil: PerfilCliente): void {
    this.original = perfil;
    this.form.reset({
      nombres: perfil.nombres,
      email: perfil.email,
      telefono: perfil.telefono ?? '',
    });
    // Si ya tenía teléfono, no se puede dejar vacío (no se borra).
    this.form.controls.telefono.setValidators(
      perfil.telefono ? [Validators.required, telefonoValido] : [telefonoValido],
    );
    this.form.controls.telefono.updateValueAndValidity();
    this.correoEnUso.set(null);
    this.errorGuardar.set(null);
  }

  /** Solo lo que cambió, ya sin espacios sobrantes. */
  private cambios(): ActualizarPerfil {
    const valor = this.form.getRawValue();
    const original = this.original!;
    const cambios: ActualizarPerfil = {};
    const nombres = valor.nombres.trim();
    const email = valor.email.trim();
    const telefono = valor.telefono.trim();
    if (nombres !== original.nombres) cambios.nombres = nombres;
    if (email !== original.email) cambios.email = email;
    if (telefono && telefono !== (original.telefono ?? '')) cambios.telefono = telefono;
    return cambios;
  }
}
