import { Directive, input, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

let seq = 0;

/** Clases comunes de input / select / textarea del portal. */
export const UI_FIELD_CLASSES =
  'w-full rounded-xl border bg-surface px-4 text-[13px] text-label outline-none transition-colors ' +
  'placeholder:text-[#9e9e9e] focus:border-brand-600 disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:text-muted';

/**
 * Base de los controles de formulario de `shared/ui`: etiqueta, hint, error y
 * `ControlValueAccessor`, así funcionan con `[formControl]`, `formControlName`
 * o `[(ngModel)]`. El error lo decide el padre: si `error` tiene texto, se muestra.
 */
@Directive()
export abstract class UiControl<T> implements ControlValueAccessor {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);

  protected readonly id = `ui-field-${++seq}`;
  protected readonly value = signal<T>(this.emptyValue());
  protected readonly disabled = signal(false);

  private onChange: (value: T) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected abstract emptyValue(): T;

  protected setValue(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T | null): void {
    this.value.set(value ?? this.emptyValue());
  }
  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
