// Código de ejemplo que muestra (y copia) cada sección del showcase.

export const SNIPPETS = {
  button: `import { UiButton } from '../../../../shared/ui';   // imports: [UiButton]

<!-- variant: primary · secondary · ghost · destructive · link   |   size: sm (32) · md (36) · lg (40) -->
<button appButton type="button">Guardar</button>
<button appButton variant="secondary" type="button">Cancelar</button>
<button appButton variant="ghost" type="button">Ver detalle</button>
<button appButton variant="destructive" type="button">Eliminar</button>
<button appButton variant="link" type="button">Ver todos</button>

<!-- Con icono (16px, currentColor) y ancho completo -->
<button appButton size="lg" [block]="true" type="submit" [disabled]="form.invalid">
  <svg width="16" height="16" …></svg>
  Nuevo pedido
</button>

<!-- También sobre enlaces -->
<a appButton variant="secondary" routerLink="/catalogo">Ver catálogo</a>`,

  input: `import { UiInput } from '../../../../shared/ui';   // imports: [UiInput, ReactiveFormsModule]

<!-- size: sm (36, barra de filtros) · md (44, por defecto) · lg (48) -->
<app-ui-input label="Correo electrónico" type="email" placeholder="tu@correo.com"
  [required]="true" autocomplete="email" [formControl]="email" />

<app-ui-input label="Contraseña" type="password" [formControl]="password"
  hint="Mínimo 8 caracteres">
  <!-- Enlace junto a la etiqueta -->
  <a slot="action" routerLink="/auth/recuperar">¿Has olvidado tu contraseña?</a>
</app-ui-input>

<!-- Solo lectura -->
<app-ui-input label="Ciudad" value="Lima" [readonly]="true" />

<!-- Con formularios, el error solo se ve cuando el campo está touched e inválido -->
<app-ui-input label="DNI" inputMode="numeric" [maxLength]="8" [formControl]="dni"
  error="Ingresa un DNI válido" />

<!-- Sin formulario, con un signal: nombre = signal('') -->
<app-ui-input label="Nombre de la dirección" placeholder="Casa, Oficina…" [(value)]="nombre" />`,

  select: `import { UiSelect, UiSelectOption } from '../../../../shared/ui';   // imports: [UiSelect, ReactiveFormsModule]

distritos: UiSelectOption[] = [
  { value: 'miraflores', label: 'Miraflores' },
  { value: 'san-isidro', label: 'San Isidro' },
];

<app-ui-select label="Distrito" placeholder="Selecciona un distrito"
  [options]="distritos" [formControl]="distrito" hint="Ciudad: Lima, Perú" />`,

  textarea: `import { UiTextarea } from '../../../../shared/ui';   // imports: [UiTextarea, ReactiveFormsModule]

<app-ui-textarea label="Motivo de la solicitud" placeholder="Cuéntanos qué pasó…"
  [rows]="4" [maxLength]="500" [formControl]="motivo" />`,

  checkbox: `import { UiCheckbox } from '../../../../shared/ui';   // imports: [UiCheckbox, ReactiveFormsModule]

<app-ui-checkbox [formControl]="acepta">Acepto los términos y condiciones</app-ui-checkbox>

<!-- Con texto secundario -->
<app-ui-checkbox [formControl]="avisos" description="Solo se usa para confirmaciones de pedido">
  Recibir notificaciones por correo
</app-ui-checkbox>`,

  badge: `import { UiBadge } from '../../../../shared/ui';   // imports: [UiBadge]

<!-- tone: neutral · brand · success · warning · danger · info   |   size: sm (24) · md (32) -->
<app-ui-badge tone="success" dot>Pagado</app-ui-badge>
<app-ui-badge tone="warning" dot>Pendiente</app-ui-badge>
<app-ui-badge tone="info" dot>En camino</app-ui-badge>
<app-ui-badge tone="danger" dot>Rechazado</app-ui-badge>
<app-ui-badge tone="success" size="md">Entregado</app-ui-badge>`,

  alert: `import { UiAlert } from '../../../../shared/ui';   // imports: [UiAlert]

<!-- tone: success · info · warning · danger. El icono (16px, currentColor) va como contenido -->
<app-ui-alert tone="success">
  <svg width="16" height="16" … stroke="currentColor" class="shrink-0"></svg>
  <p>Entrega estimada: 2–3 días hábiles</p>
</app-ui-alert>

<!-- Error de formulario -->
@if (error()) {
  <app-ui-alert tone="danger">{{ error() }}</app-ui-alert>
}`,

  card: `import { UiCard, UiButton } from '../../../../shared/ui';   // imports: [UiCard, UiButton]

<!-- Con cabecera, acciones y pie -->
<app-ui-card title="Resumen del pedido" subtitle="3 productos · actualizado hace 2 h">
  <button slot="actions" appButton variant="secondary" size="sm" type="button">Editar</button>
  …contenido…
  <div slot="footer" class="flex justify-end gap-2">…botones…</div>
</app-ui-card>

<!-- Solo cuerpo: el layout interno va en bodyClass. padding: none · sm (16) · md (20) -->
<app-ui-card bodyClass="gap-4">…</app-ui-card>
<app-ui-card padding="none">…tabla…</app-ui-card>`,

  modal: `import { UiModal, UiButton } from '../../../../shared/ui';   // imports: [UiModal, UiButton]

abierto = signal(false);

<button appButton type="button" (click)="abierto.set(true)">Nueva dirección</button>

@if (abierto()) {
  <app-ui-modal
    title="Nueva dirección"
    description="Se usará para tus envíos"
    hint="Los campos con * son obligatorios"
    (closed)="abierto.set(false)"
  >
    …contenido…
    <ng-container slot="footer">
      <button appButton variant="secondary" type="button" (click)="abierto.set(false)">Cancelar</button>
      <button appButton type="button" (click)="guardar()">Guardar</button>
    </ng-container>
  </app-ui-modal>
}`,

  confirm: `import { ConfirmDialog } from '../../../../shared/ui';   // imports: [ConfirmDialog]

@if (confirmando()) {
  <app-confirm-dialog
    title="¿Cancelar pedido?"
    message="Esta acción no se puede deshacer."
    confirmLabel="Sí, cancelar"
    (confirmed)="cancelar()"
    (cancelled)="confirmando.set(false)" />
}`,

  toast: `import { ToastService } from '../../../../shared/ui';

// <app-toaster /> ya está montado en app.html: solo inyecta el servicio.
private readonly toast = inject(ToastService);

this.toast.success('Producto agregado', 'Papas clásicas x2');
this.toast.warning('Stock bajo', 'Solo quedan 3 unidades');
this.toast.error('No se pudo guardar');
this.toast.info('Tu pedido está en camino');`,

  quantity: `import { UiQuantity } from '../../../../shared/ui';   // imports: [UiQuantity]

cantidad = signal(1);

<app-ui-quantity [(value)]="cantidad" [min]="1" [max]="producto.stock"
  label="Cantidad de Papas clásicas" />`,

  stepProgress: `import { UiStepProgress } from '../../../../shared/ui';   // imports: [UiStepProgress]

<app-ui-step-progress [step]="2" [total]="3" />`,
} as const;
