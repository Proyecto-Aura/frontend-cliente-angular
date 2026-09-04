import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStepper } from '../../components/auth-stepper/auth-stepper';
import { AuthRegisterDataForm } from '../../components/auth-register-data-form/auth-register-data-form';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { RegistroPayload } from '../../models/registro.model';

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
        <app-auth-register-data-form (submitted)="onRegistro($event)" />
      </div>
    </section>
  `,
})
export class AuthRegistroDatos {
  private readonly store = inject(AuthRegistroStore);
  private readonly router = inject(Router);

  constructor() {
    // Si se entra directo al paso 2 sin completar el paso 1, volver al inicio.
    if (!this.store.documentoListo()) {
      this.router.navigate(['/auth/registro/documento']);
    }
  }

  protected onRegistro(payload: RegistroPayload): void {
    // TODO: llamar a AuthService.registrar(payload); al éxito redirigir a login/onboarding.
    console.log('registro', payload);
  }
}
