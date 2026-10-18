import { Component, input } from '@angular/core';

/** Encabezado de sección de un paso del registro: círculo numerado + título + "n/total". */
@Component({
  selector: 'app-auth-section-header',
  host: { class: 'block' },
  templateUrl: './auth-section-header.html',
})
export class AuthSectionHeader {
  readonly step = input.required<number>();
  readonly total = input.required<number>();
  readonly title = input.required<string>();
}
