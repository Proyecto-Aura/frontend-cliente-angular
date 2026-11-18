import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthLoginForm } from '../../components/auth-login-form/auth-login-form';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { LoginRequest, SinAccesoAlPortalError } from '../../models/auth.model';

/** El aviso de login exitoso dura menos que el resto: solo hay que confirmar y salir. */
const DURACION_AVISO_LOGIN_MS = 3000;

/** HU-B-001: inicio de sesión del portal cliente (hija de auth-layout). */
@Component({
  selector: 'app-auth-login',
  imports: [AuthLoginForm],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-login.html',
})
export class AuthLogin {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly avisos = inject(Avisos);

  protected readonly enviando = signal(false);

  constructor() {
    // Fuera de un modal el toast va siempre, aunque la vista no se cierre.
    const query = inject(ActivatedRoute).snapshot.queryParamMap;
    /** HU-B-002 (RF-B10): llega desde el registro con `?registrado=1`. */
    if (query.get('registrado') === '1') {
      this.avisos.mostrar(
        'Tu cuenta fue creada',
        'Te enviamos un correo de verificación: debes verificar tu email antes de tu primer ingreso.',
        'success',
        { etiqueta: '¿No te llegó? Reenviar', ruta: '/auth/reenviar-verificacion' },
      );
    }
    /** HU-B-003 (RF-B13): llega tras cambiar la contraseña con `?restablecida=1`. */
    if (query.get('restablecida') === '1') {
      this.avisos.mostrar(
        'Tu contraseña se cambió correctamente',
        'Inicia sesión con tu nueva contraseña.',
        'success',
      );
    }
  }

  protected onLogin(credentials: LoginRequest): void {
    this.enviando.set(true);
    this.api.login(credentials).subscribe({
      next: () => {
        this.enviando.set(false);
        this.avisos.mostrar(
          'Inicio de sesión exitoso',
          `Bienvenido, ${credentials.identificador}.`,
          'success',
          undefined,
          DURACION_AVISO_LOGIN_MS,
        );
        // Navega justo cuando el toast se autocierra, no antes: que de tiempo a leerlo.
        setTimeout(() => void this.router.navigate(['/catalogo']), DURACION_AVISO_LOGIN_MS);
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        /** HU-A-005: el backend responde 403 si el correo del cliente no está verificado. */
        const sinVerificar = err instanceof HttpErrorResponse && err.status === 403;
        const mensaje =
          err instanceof SinAccesoAlPortalError
            ? err.message
            : apiErrorMessage(
                err,
                'No pudimos iniciar sesión. Verifica tus datos e inténtalo de nuevo.',
              );
        this.avisos.mostrar(
          mensaje,
          undefined,
          'error',
          sinVerificar
            ? {
                etiqueta: 'Reenviar correo de verificación',
                ruta: '/auth/reenviar-verificacion',
                // Si entró con su correo, se lo lleva prellenado a pedir otro enlace.
                ...(credentials.identificador.includes('@')
                  ? { queryParams: { email: credentials.identificador } }
                  : {}),
              }
            : undefined,
        );
      },
    });
  }
}
