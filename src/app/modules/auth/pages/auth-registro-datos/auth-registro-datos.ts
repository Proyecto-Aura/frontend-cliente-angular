import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { AuthRegisterDataForm } from '../../components/auth-register-data-form/auth-register-data-form';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { OPCIONES_DOCUMENTO, RegisterClientePayload } from '../../models/registro.model';

/** Registro · paso 2 (datos). Hijo de auth-layout. */
@Component({
  selector: 'app-auth-registro-datos',
  imports: [RouterLink, AuthRegisterDataForm],
  host: { class: 'block w-full max-w-[600px] my-auto animate-fade-up' },
  templateUrl: './auth-registro-datos.html',
})
export class AuthRegistroDatos {
  private readonly store = inject(AuthRegistroStore);
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly titulo = computed(() =>
    this.store.esEmpresa() ? 'Registro de Empresa' : 'Completa tu registro',
  );
  protected readonly subtitulo = computed(() => {
    const doc = this.store.doc();
    const label = OPCIONES_DOCUMENTO.find((o) => o.tipo === doc?.tipoDocumento)?.label ?? '';
    return `${label} · ${doc?.numeroDocumento ?? ''}`;
  });

  constructor() {
    if (!this.store.documentoListo()) {
      void this.router.navigate(['/auth/registro/documento']);
    }
  }

  /** RF-B10: con la cuenta creada, al login con el aviso de verificar el correo. */
  protected onRegistro(payload: RegisterClientePayload): void {
    this.enviando.set(true);
    this.error.set(null);
    this.api.registrarCliente(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.store.reset();
        void this.router.navigate(['/auth/login'], { queryParams: { registrado: 1 } });
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.error.set(
          apiErrorMessage(
            err,
            'No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.',
          ),
        );
      },
    });
  }
}
