import { Directive, computed, input } from '@angular/core';

/**
 * Variantes del DS: primary · secondary · ghost · destructive · link.
 * `outline`, `soft` y `danger` son nombres anteriores que se mantienen como alias
 * (outline/soft → secondary, danger → destructive) para no romper pantallas ya migradas.
 */
export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'link'
  | 'outline'
  | 'soft'
  | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium ' +
  'transition-colors duration-[120ms] focus-visible:shadow-focus focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-45';

const VARIANTS: Record<UiButtonVariant, string> = {
  primary: 'border-transparent bg-primary text-white hover:bg-primary-hover active:bg-primary-active disabled:hover:bg-primary',
  secondary: 'border-border bg-white text-foreground hover:bg-background disabled:hover:bg-white',
  ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent hover:text-primary disabled:hover:bg-transparent',
  destructive: 'border-transparent bg-destructive text-white hover:bg-destructive-hover disabled:hover:bg-destructive',
  link: '!h-auto !px-0 border-transparent bg-transparent text-primary hover:underline',
  outline: 'border-border bg-white text-foreground hover:bg-background disabled:hover:bg-white',
  soft: 'border-border bg-white text-foreground hover:bg-background disabled:hover:bg-white',
  danger: 'border-transparent bg-destructive text-white hover:bg-destructive-hover disabled:hover:bg-destructive',
};

const SIZES: Record<UiButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[12px]',
  md: 'h-9 px-3.5 text-[14px]',
  lg: 'h-10 px-[18px] text-[14px]',
};

/**
 * Botón del DS. Se aplica sobre un `<button>` o `<a>` nativo para conservar su
 * semántica y accesibilidad:
 * `<button appButton variant="primary" size="md" type="button">Guardar</button>`.
 * Un solo `primary` por vista; el resto `secondary` o `ghost`.
 */
@Directive({
  selector: 'button[appButton], a[appButton]',
  host: { '[class]': 'classes()' },
})
export class UiButton {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  /** Ocupa todo el ancho del contenedor. */
  readonly block = input(false);

  protected readonly classes = computed(
    () =>
      `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}${this.block() ? ' w-full' : ''}`,
  );
}
