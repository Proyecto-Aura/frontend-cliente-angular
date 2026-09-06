import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthInput } from '../auth-input/auth-input';
import { AuthSectionHeader } from '../auth-section-header/auth-section-header';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import {
  OPCIONES_DOCUMENTO,
  OpcionDocumento,
  TipoDocumento,
} from '../../models/registro.model';

/** Paso 1 del registro: elegir tipo de documento y escribir el número. */
@Component({
  selector: 'app-auth-register-doc-form',
  imports: [ReactiveFormsModule, AuthInput, AuthSectionHeader],
  host: { class: 'block' },
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
      <app-auth-section-header [step]="1" [total]="2" title="Selecciona Documento" />

      <label class="flex flex-col gap-1.5">
        <span class="text-[13px] font-semibold text-label">Tipo de documento</span>
        <select
          formControlName="tipo"
          class="h-[38px] w-full rounded-lg border border-line bg-surface px-[13px] text-[14px] outline-none transition-colors focus:border-brand-600"
          [class.text-muted]="!form.controls.tipo.value"
          [class.text-label]="form.controls.tipo.value"
        >
          <option value="" disabled>Selecciona un tipo</option>
          @for (op of opciones; track op.tipo) {
            <option [value]="op.tipo">{{ op.label }}</option>
          }
        </select>
      </label>

      <app-auth-input
        label="Número de documento"
        [control]="documento"
        [placeholder]="opcionActual()?.placeholder ?? 'Selecciona primero un tipo'"
        [hint]="opcionActual()?.ayuda ?? null"
        inputMode="text"
        error="El número no tiene un formato válido para el documento elegido."
      />

      <button
        type="submit"
        [disabled]="form.invalid"
        class="mt-1 h-[38px] w-full rounded-[6px] border text-[15px] font-medium transition duration-150 active:scale-[0.99]"
        [class.bg-brand-600]="form.valid"
        [class.border-brand-600]="form.valid"
        [class.text-white]="form.valid"
        [class.hover:bg-brand-700]="form.valid"
        [class.bg-line-soft]="form.invalid"
        [class.border-line-soft]="form.invalid"
        [class.text-muted]="form.invalid"
        [class.cursor-not-allowed]="form.invalid"
      >
        Siguiente
      </button>
    </form>
  `,
})
export class AuthRegisterDocForm {
  private readonly router = inject(Router);
  private readonly store = inject(AuthRegistroStore);

  protected readonly opciones = OPCIONES_DOCUMENTO;

  protected readonly form = new FormGroup({
    tipo: new FormControl<TipoDocumento | ''>('', { nonNullable: true, validators: [Validators.required] }),
    documento: new FormControl('', { nonNullable: true }),
  });

  /** Getter (no computed): el valor del control no es una señal. */
  protected opcionActual(): OpcionDocumento | undefined {
    return this.opciones.find((o) => o.tipo === this.form.controls.tipo.value);
  }

  constructor() {
    const previo = this.store.doc();
    if (previo) {
      this.form.setValue({ tipo: previo.tipoDocumento, documento: previo.numeroDocumento });
    }
    this.applyDocumentoValidators(this.form.controls.tipo.value);

    this.form.controls.tipo.valueChanges.pipe(takeUntilDestroyed()).subscribe((tipo) => {
      this.form.controls.documento.reset('');
      this.applyDocumentoValidators(tipo);
    });
  }

  protected get documento(): FormControl<string> {
    return this.form.controls.documento;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { tipo, documento } = this.form.getRawValue();
    const tipoDocumento = tipo as TipoDocumento;
    this.store.setDocumento({
      tipoDocumento,
      tipoCliente: tipoDocumento === 'ruc' ? 'empresa' : 'persona_natural',
      numeroDocumento: documento.trim(),
    });
    this.router.navigate(['/auth/registro/datos']);
  }

  private applyDocumentoValidators(tipo: TipoDocumento | ''): void {
    const opcion = this.opciones.find((o) => o.tipo === tipo);
    this.form.controls.documento.setValidators(
      opcion ? [Validators.required, Validators.pattern(opcion.patron)] : [Validators.required],
    );
    this.form.controls.documento.updateValueAndValidity();
  }
}
