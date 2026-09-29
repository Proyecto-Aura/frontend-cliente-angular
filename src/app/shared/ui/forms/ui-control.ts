import { DestroyRef, Directive, DoCheck, computed, inject, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

let seq = 0;

export type UiFieldSize = 'sm' | 'md' | 'lg';

/** Alturas del DS para campos: sm 36 (barra de filtros) · md 44 · lg 48. */
export const UI_FIELD_HEIGHTS: Record<UiFieldSize, string> = {
  sm: 'h-9',
  md: 'h-11',
  lg: 'h-12',
};

/** Clases comunes de input / select / textarea del DS (radio 10px, borde 1px, anillo de foco rojo). */
export const UI_FIELD_CLASSES =
  'w-full rounded-field border bg-white px-3.5 text-[14px] text-foreground shadow-field outline-none ' +
  'transition-[border-color,box-shadow,background-color] duration-[120ms] placeholder:text-muted-foreground ' +
  'focus:border-primary focus:shadow-focus ' +
  'disabled:cursor-not-allowed disabled:bg-background disabled:text-muted-foreground';

/** Estado inválido del DS: borde destructivo y fondo rojo al 4%. */
export const UI_FIELD_INVALID = '!border-destructive !bg-[rgb(210_43_43/0.04)]';

/**
 * Base de los controles de formulario de `shared/ui`: etiqueta, hint y error.
 * Sirve de dos formas:
 * - Con Reactive Forms (`[formControl]` / `formControlName`): el `error` solo se
 *   muestra cuando el control está `touched` e inválido.
 * - Con signals (`[(value)]="nombre"`): el `error` se muestra siempre que tenga texto.
 */
@Directive()
export abstract class UiControl<T> implements ControlValueAccessor, DoCheck {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  /** Marca el campo como obligatorio: asterisco rojo junto a la etiqueta. */
  readonly required = input(false);
  readonly value = model<T>(this.emptyValue());

  protected readonly id = `ui-field-${++seq}`;
  protected readonly disabled = signal(false);

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);
  /** Se incrementa con cada cambio del FormControl (touched, status…) para recalcular el error. */
  private readonly controlTick = signal(0);
  private controlSub: Subscription | null = null;

  /** Error visible según las reglas de arriba. */
  protected readonly visibleError = computed(() => {
    this.controlTick();
    const message = this.error();
    const control = this.ngControl?.control;
    if (!message || !control) return message;
    return control.touched && control.invalid ? message : null;
  });

  private onChange: (value: T) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
    this.destroyRef.onDestroy(() => this.controlSub?.unsubscribe());
  }

  protected abstract emptyValue(): T;

  /** El FormControl se enlaza después de crear el componente: se escucha en cuanto existe. */
  ngDoCheck(): void {
    const control = this.ngControl?.control;
    if (control && !this.controlSub) {
      this.controlSub = control.events.subscribe(() => this.controlTick.update((n) => n + 1));
      this.controlTick.update((n) => n + 1);
    }
  }

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
