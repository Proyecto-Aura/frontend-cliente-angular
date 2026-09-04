import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthInput } from '../auth-input/auth-input';
import { AuthRegistroStore } from '../../services/auth-registro-store';
import { TipoRegistro } from '../../models/registro.model';

/** Paso 1 del registro: elegir tipo de cuenta y escribir el documento (DNI / RUC). */
@Component({
  selector: 'app-auth-register-doc-form',
  imports: [ReactiveFormsModule, AuthInput],
  host: { class: 'block' },
  templateUrl: './auth-register-doc-form.html',
})
export class AuthRegisterDocForm {
  private readonly router = inject(Router);
  private readonly store = inject(AuthRegistroStore);

  protected readonly form = new FormGroup({
    tipo: new FormControl<TipoRegistro>('persona', { nonNullable: true }),
    documento: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    const tipoPrevio = this.store.tipo();
    if (tipoPrevio) {
      this.form.setValue({ tipo: tipoPrevio, documento: this.store.documento() });
    }
    this.applyDocumentoValidators(this.form.controls.tipo.value);

    this.form.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((tipo) => {
        this.form.controls.documento.reset('');
        this.applyDocumentoValidators(tipo);
      });
  }

  protected get tipo(): TipoRegistro {
    return this.form.controls.tipo.value;
  }

  protected get documento(): FormControl<string> {
    return this.form.controls.documento;
  }

  protected setTipo(tipo: TipoRegistro): void {
    this.form.controls.tipo.setValue(tipo);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.setDocumento(this.form.getRawValue());
    this.router.navigate(['/auth/registro/datos']);
  }

  private applyDocumentoValidators(tipo: TipoRegistro): void {
    const digits = tipo === 'empresa' ? 11 : 8;
    this.form.controls.documento.setValidators([
      Validators.required,
      Validators.pattern(new RegExp(`^\\d{${digits}}$`)),
    ]);
    this.form.controls.documento.updateValueAndValidity();
  }
}
