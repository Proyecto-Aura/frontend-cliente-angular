import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStepper } from '../../components/auth-stepper/auth-stepper';
import { AuthRegisterDocForm } from '../../components/auth-register-doc-form/auth-register-doc-form';

/** Registro · paso 1 (documento). Hijo de auth-layout. */
@Component({
  selector: 'app-auth-registro-documento',
  imports: [RouterLink, AuthStepper, AuthRegisterDocForm],
  host: { class: 'block w-full max-w-[564px] my-auto' },
  template: `
    <section
      class="w-full rounded-3xl bg-surface p-10 shadow-[0_30px_80px_-24px_rgba(17,24,39,0.22)] sm:px-14 sm:py-14"
    >
      <app-auth-stepper [steps]="['Documento', 'Datos']" [current]="0" />

      <h2 class="mt-8 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        Crear cuenta
      </h2>
      <p class="mt-2 text-[15px] text-ink-soft">
        Elige el tipo de cuenta y escribe tu número de documento.
      </p>

      <div class="mt-8">
        <app-auth-register-doc-form />
      </div>

      <p class="mt-6 text-center text-sm text-ink-soft">
        ¿Ya tienes cuenta?
        <a routerLink="/auth/login" class="font-semibold text-brand-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </section>
  `,
})
export class AuthRegistroDocumento {}
