import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Fecha de hoy del navegador en formato YYYY-MM-DD (el de `<input type="date">`). */
export function hoyISO(hoy = new Date()): string {
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

/** La fecha de nacimiento no puede ser posterior a hoy. Error: `fechaFutura`. */
export function fechaNoFutura(hoy: () => string = hoyISO): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null =>
    control.value && control.value > hoy() ? { fechaFutura: true } : null;
}
