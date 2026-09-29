import { Directive, computed, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition duration-150 ' +
  'active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'disabled:pointer-events-none disabled:opacity-40';

const VARIANTS: Record<UiButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary: 'border border-line-soft bg-surface text-ink-soft hover:bg-canvas',
  soft: 'bg-[#f5f5f5] text-ink-soft hover:bg-[#eeeeee]',
  outline: 'border border-line-soft bg-surface text-ink-soft hover:border-brand-600 hover:text-brand-600',
  ghost: 'text-ink-soft hover:bg-brand-50 hover:text-brand-600',
  danger: 'text-[#ba1a1a] hover:bg-[#fde0e0]',
};

const SIZES: Record<UiButtonSize, string> = {
  sm: 'h-[30px] rounded-lg px-3 text-[12px]',
  md: 'h-[38px] rounded-xl px-5 text-[13px]',
  lg: 'h-[44px] rounded-xl px-8 text-[14px]',
};

/**
 * Estilo de botón del portal. Se aplica sobre un `<button>` o `<a>` nativo para
 * conservar su semántica y accesibilidad:
 * `<button appButton variant="primary" size="md" type="button">Guardar</button>`.
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
