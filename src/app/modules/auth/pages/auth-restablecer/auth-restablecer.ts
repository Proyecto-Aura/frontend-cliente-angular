import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthInput } from '../../components/auth-input/auth-input';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';

/** Mínimo que exige el backend para la nueva contraseña. */
export const MIN_CONTRASENA = 8;

/** La confirmación debe ser igual a la nueva contraseña (RF-B12). */
function igualANueva(confirmar: AbstractControl<string>): ValidationErrors | null {
  const nueva = confirmar.parent?.get('nueva')?.value as string | undefined;
  return confirmar.value && confirmar.value !== nueva ? { noCoincide: true } : null;
}

/**
 * HU-B-003 (RF-B12, RF-B13): la página del enlace del correo
 * (`/reset-password?token=…`). El cliente escribe y confirma la nueva
 * contraseña y vuelve al login.
 */
@Component({
  selector: 'app-auth-restablecer',
  imports: [ReactiveFormsModule, RouterLink, AuthInput],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-restablecer.html',
})
export class AuthRestablecer {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';
  protected readonly minimo = MIN_CONTRASENA;

  protected readonly form = new FormGroup({
    nueva: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(MIN_CONTRASENA),
        Validators.maxLength(255),
      ],
    }),
    confirmar: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, igualANueva],
    }),
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Si cambia la nueva, la confirmación se vuelve a comparar.
    this.form.controls.nueva.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmar.updateValueAndValidity());
  }

  protected guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando()) return;

    const { nueva, confirmar } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);
    this.api
      .restablecerContrasena({
        token: this.token,
        nueva_contrasena: nueva,
        confirmar_contrasena: confirmar,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          // RF-B13: al confirmar el cambio, de vuelta al login.
          void this.router.navigate(['/auth/login'], {
            queryParams: { restablecida: 1 },
            replaceUrl: true,
          });
        },
        error: (err: unknown) => {
          this.enviando.set(false);
          this.error.set(
            apiErrorMessage(err, 'No pudimos cambiar tu contraseña. Inténtalo de nuevo.'),
          );
        },
      });
  }
}
