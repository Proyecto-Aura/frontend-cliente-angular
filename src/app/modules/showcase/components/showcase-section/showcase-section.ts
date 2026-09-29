import { Component, input, signal } from '@angular/core';

import { UiButton } from '../../../../shared/ui';

/** Bloque del showcase: título, demo en vivo (contenido) y código listo para copiar. */
@Component({
  selector: 'app-showcase-section',
  imports: [UiButton],
  host: { class: 'block scroll-mt-20', '[id]': 'sectionId()' },
  templateUrl: './showcase-section.html',
})
export class ShowcaseSection {
  readonly sectionId = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input('');
  readonly code = input('');

  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    } catch {
      /* sin permiso de portapapeles: el código sigue visible para copiar a mano */
    }
  }
}
