import { Component, input } from '@angular/core';

export type IconName =
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'log-out'
  | 'mail'
  | 'map-pin'
  | 'phone'
  | 'plus'
  | 'search'
  | 'search-x'
  | 'shopping-cart'
  | 'sliders-horizontal'
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
