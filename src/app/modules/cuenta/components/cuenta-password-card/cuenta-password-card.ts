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
import { ContrasenaApi } from '../../services/contrasena-api';

/** Mismo mínimo que pide el backend (y la recuperación de contraseña). */
export const CONTRASENA_MINIMA = 8;
const CONTRASENA_MAXIMA = 255;
/** El backend responde 400 con este texto si la contraseña actual no es la correcta. */
const ACTUAL_INCORRECTA = 'La contraseña actual no es correcta';

type Campo = 'actual' | 'nueva' | 'confirmar';

function coinciden(grupo: AbstractControl): ValidationErrors | null {
  const { nueva, confirmar } = (grupo as FormGroup).controls;
  return confirmar.value && nueva.value !== confirmar.value ? { noCoincide: true } : null;
}

function distintaDeLaActual(grupo: AbstractControl): ValidationErrors | null {
  const { actual, nueva } = (grupo as FormGroup).controls;
  return nueva.value && actual.value === nueva.value ? { igualALaActual: true } : null;
}

/**
 * HU-B-017 (RF-B45): el cliente cambia su contraseña escribiendo antes la
 * actual. Sigue conectado en esta sesión; el backend cierra las demás.
 */
@Component({
  selector: 'app-cuenta-password-card',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './cuenta-password-card.html',
})
export class CuentaPasswordCard {
  private readonly api = inject(ContrasenaApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly minimo = CONTRASENA_MINIMA;
  protected readonly form = new FormGroup(
    {
      actual: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(CONTRASENA_MAXIMA)],
      }),
      nueva: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(CONTRASENA_MINIMA),
          Validators.maxLength(CONTRASENA_MAXIMA),
        ],
      }),
      confirmar: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: [coinciden, distintaDeLaActual] },
  );

  protected readonly mostrar = signal(false);
  protected readonly guardando = signal(false);
  protected readonly guardado = signal(false);
  protected readonly errorGuardar = signal<string | null>(null);
  /** El servidor dijo que la contraseña actual no es correcta. */
  protected readonly actualIncorrecta = signal(false);

  constructor() {
    // Al escribir de nuevo, el aviso anterior ya no aplica.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.form.dirty) this.guardado.set(false);
      this.errorGuardar.set(null);
    });
    this.form.controls.actual.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.actualIncorrecta.set(false));
  }

  protected guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    const { actual, nueva, confirmar } = this.form.getRawValue();
    this.guardando.set(true);
    this.errorGuardar.set(null);
    this.api
      .cambiar({
        contrasena_actual: actual,
        nueva_contrasena: nueva,
        confirmar_contrasena: confirmar,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.form.reset();
          this.mostrar.set(false);
          this.guardado.set(true);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          const mensaje = apiErrorMessage(
            err,
            'No pudimos cambiar tu contraseña. Inténtalo de nuevo.',
          );
          if (
            err instanceof HttpErrorResponse &&
            err.status === 400 &&
            mensaje === ACTUAL_INCORRECTA
          ) {
            this.actualIncorrecta.set(true);
          } else {
            this.errorGuardar.set(mensaje);
          }
        },
      });
  }

  /** Mensaje del campo si ya se tocó y no es válido. */
  protected error(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (campo === 'actual' && this.actualIncorrecta()) return ACTUAL_INCORRECTA;
    if (!control.touched) return null;
    if (control.hasError('required')) {
      return {
        actual: 'Ingresa tu contraseña actual',
        nueva: 'Ingresa tu nueva contraseña',
        confirmar: 'Confirma tu nueva contraseña',
      }[campo];
    }
    if (control.hasError('minlength')) return `Debe tener al menos ${this.minimo} caracteres`;
    if (control.hasError('maxlength')) return 'Es demasiado larga';
    if (campo === 'nueva' && this.form.hasError('igualALaActual')) {
      return 'Debe ser distinta de tu contraseña actual';
    }
    if (campo === 'confirmar' && this.form.hasError('noCoincide')) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }
}
