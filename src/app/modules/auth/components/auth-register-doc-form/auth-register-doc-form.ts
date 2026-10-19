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
  tipoClienteDe,
} from '../../models/registro.model';

/** Paso 1 del registro: elegir tipo de documento y escribir el número. */
@Component({
  selector: 'app-auth-register-doc-form',
  imports: [ReactiveFormsModule, AuthInput, AuthSectionHeader],
  host: { class: 'block' },
  templateUrl: './auth-register-doc-form.html',
})
export class AuthRegisterDocForm {
  private readonly router = inject(Router);
  private readonly store = inject(AuthRegistroStore);

  protected readonly opciones = OPCIONES_DOCUMENTO;

  protected readonly form = new FormGroup({
    tipo: new FormControl<TipoDocumento | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
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
    const numeroDocumento = documento.trim();
    this.store.setDocumento({
      tipoDocumento,
      tipoCliente: tipoClienteDe(tipoDocumento, numeroDocumento),
      numeroDocumento,
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
