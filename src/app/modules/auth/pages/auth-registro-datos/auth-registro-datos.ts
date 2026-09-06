import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';

import { AuthRegisterDataForm } from '../../components/auth-register-data-form/auth-register-data-form';
import { AuthAccountCreatedDialog } from '../../components/auth-account-created-dialog/auth-account-created-dialog';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { AuthApi } from '../../services/auth-api';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { OPCIONES_DOCUMENTO, RegisterClientePayload } from '../../models/registro.model';

/** Registro · paso 2 (datos). Hijo de auth-layout. */
@Component({
  selector: 'app-auth-registro-datos',
  imports: [RouterLink, AuthRegisterDataForm, AuthAccountCreatedDialog],
  host: { class: 'block w-full max-w-[600px] my-auto animate-fade-up' },
  template: `
    <section
      class="flex w-full flex-col gap-6 rounded-[25px] bg-surface px-[30px] py-[40px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)]"
    >
      <a routerLink="/auth/registro/documento" class="flex w-fit items-center gap-2 text-[14px] font-medium text-muted hover:text-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
        </svg>
        Atrás
      </a>

      <div class="flex flex-col gap-1">
        <h1 class="font-display text-[32px] font-extrabold leading-tight tracking-[-0.96px] text-black">
          {{ titulo() }}
        </h1>
        <p class="text-[14px] font-medium text-ink-soft">{{ subtitulo() }}</p>
      </div>

      <app-auth-register-data-form
        [enviando]="enviando()"
        [error]="error()"
        (submitted)="onRegistro($event)"
      />
    </section>

    @if (exitoEmail(); as email) {
      <app-auth-account-created-dialog [email]="email" (confirm)="irALogin()" />
    }
  `,
})
export class AuthRegistroDatos {
  private readonly store = inject(AuthRegistroStore);
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exitoEmail = signal<string | null>(null);

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
      this.router.navigate(['/auth/registro/documento']);
    }
  }

  protected onRegistro(payload: RegisterClientePayload): void {
    this.enviando.set(true);
    this.error.set(null);
    this.api.registrarCliente(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.exitoEmail.set(payload.email);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(
          apiErrorMessage(err, 'No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.'),
        );
      },
    });
  }

  protected irALogin(): void {
    this.store.reset();
    this.router.navigate(['/auth/login'], { queryParams: { registrado: 1 } });
  }
}
