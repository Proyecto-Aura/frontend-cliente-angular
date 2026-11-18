import { Component, computed, input, output } from '@angular/core';

import { Icon, IconName } from '../icon/icon';

export type AlertTone = 'success' | 'error' | 'warning' | 'info';

/** Mismo patrón que el DS de francos-front (admin), calcado para Portal B. */
const ICONO_TONO: Record<AlertTone, IconName> = {
  success: 'circle-check',
  error: 'circle-x',
  warning: 'triangle-alert',
  info: 'info',
};

const ETIQUETA_TONO: Record<AlertTone, string> = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información',
};

const CLASES_FONDO_TONO: Record<AlertTone, string> = {
  success: 'bg-success-50',
  error: 'bg-danger-50',
  warning: 'bg-warning-50',
  info: 'bg-info-50',
};

const CLASES_TEXTO_TONO: Record<AlertTone, string> = {
  success: 'text-success-700',
  error: 'text-danger-700',
  warning: 'text-warning-700',
  info: 'text-info-700',
};

const CLASES_INSIGNIA_TONO: Record<AlertTone, string> = {
  success: 'bg-success',
  error: 'bg-destructive',
  warning: 'bg-warning',
  info: 'bg-info',
};

/**
 * Alerta de color sólido (verde/roja/amarilla/azul), en línea o como toast:
 * el wrapper fixed/flotante lo arma quien la use (ver `app-aviso`).
 * `title` = la acción en negrita ("Credenciales inválidas"); `description` = el
 * detalle debajo, sin negrita. `role` es "alert" solo en error (interrumpe al
 * lector de pantalla); en los demás tonos es "status".
 *
 * El `role` y el fondo van en el host (no en un `<div>` interno) para que
 * quien necesite enfocar la alerta al aparecer (accesibilidad) pueda ponerle
 * `tabindex="-1"` directo a `<app-alert>` y enfocar exactamente el nodo con
 * `role="alert"`, no un wrapper alrededor.
 */
@Component({
  selector: 'app-alert',
  imports: [Icon],
  host: {
    '[class]': 'clasesHost()',
    '[attr.role]': 'rol()',
  },
  templateUrl: './alert.html',
})
export class Alert {
  readonly tone = input<AlertTone>('info');
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly linkLabel = input<string | null>(null);
  readonly closable = input(true);

  readonly closed = output<void>();
  readonly linkClick = output<void>();

  protected readonly icono = computed(() => ICONO_TONO[this.tone()]);
  protected readonly etiqueta = computed(() => ETIQUETA_TONO[this.tone()]);
  protected readonly claseTexto = computed(() => CLASES_TEXTO_TONO[this.tone()]);
  protected readonly claseInsignia = computed(() => CLASES_INSIGNIA_TONO[this.tone()]);
  protected readonly rol = computed(() => (this.tone() === 'error' ? 'alert' : 'status'));
  protected readonly clasesHost = computed(
    () => `flex gap-3 rounded-lg px-5 py-4 ${CLASES_FONDO_TONO[this.tone()]}`,
  );
}
