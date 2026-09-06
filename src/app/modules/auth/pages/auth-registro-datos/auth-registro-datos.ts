import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthStepper } from '../../components/auth-stepper/auth-stepper';
import { AuthRegisterDataForm } from '../../components/auth-register-data-form/auth-register-data-form';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { RegisterClientePayload } from '../../models/registro.model';

/** Registro · paso 2 (datos). Hijo de auth-layout. */
@Component({
  selector: 'app-auth-registro-datos',
  imports: [AuthStepper, AuthRegisterDataForm],
  host: { class: 'block w-full max-w-[564px] my-auto' },
  template: `
    <section
      class="w-full rounded-3xl bg-surface p-10 shadow-[0_30px_80px_-24px_rgba(17,24,39,0.22)] sm:px-14 sm:py-14"
    >
      <app-auth-stepper [steps]="['Documento', 'Datos']" [current]="1" />

      <h2 class="mt-8 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        Completa tus datos
      </h2>
      <p class="mt-2 text-[15px] text-ink-soft">Ya casi terminas. Crea tu cuenta para empezar a comprar.</p>

      <div class="mt-8">
        <app-auth-register-data-form
          [enviando]="enviando()"
          [error]="error()"
          (submitted)="onRegistro($event)"
        />
      </div>
    </section>
  `,
})
export class AuthRegistroDatos {
  private readonly store = inject(AuthRegistroStore);
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Si se entra directo al paso 2 sin completar el paso 1, volver al inicio.
    if (!this.store.documentoListo()) {
      this.router.navigate(['/auth/registro/documento']);
    }
  }

  protected onRegistro(payload: RegisterClientePayload): void {
    this.enviando.set(true);
    this.error.set(null);
    this.api.registrarCliente(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.store.reset();
        this.router.navigate(['/auth/login'], { queryParams: { registrado: 1 } });
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(
          apiErrorMessage(err, 'No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.'),
        );
      },
    });
  }
}
