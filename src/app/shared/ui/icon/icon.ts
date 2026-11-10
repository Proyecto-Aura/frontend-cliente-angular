import { Component, input } from '@angular/core';

export type IconName =
  | 'arrow-left'
  | 'banknote'
  | 'clock'
  | 'check'
  | 'circle-check'
  | 'circle-x'
  | 'credit-card'
  | 'file-text'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'info'
  | 'log-out'
  | 'mail'
  | 'message-square'
  | 'map-pin'
  | 'minus'
  | 'phone'
  | 'paperclip'
  | 'plus'
  | 'qr-code'
  | 'search'
  | 'search-x'
  | 'shield-check'
  | 'shopping-cart'
  | 'sliders-horizontal'
  | 'truck'
  | 'undo-2'
  | 'user'
  | 'x';

/** Íconos Lucide en línea (los del prototipo), en el color del texto. */
@Component({
  selector: 'app-icon',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  templateUrl: './icon.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
}
