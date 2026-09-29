// Código de ejemplo que muestra (y copia) cada sección del showcase.

export const SNIPPETS = {
  button: `import { UiButton } from '../../../../shared/ui';   // imports: [UiButton]

<button appButton type="button">Primario</button>
<button appButton variant="secondary" type="button">Secundario</button>
<button appButton variant="soft" type="button">Suave</button>
<button appButton variant="outline" size="sm" type="button">Outline</button>
<button appButton variant="ghost" type="button">Ghost</button>
<button appButton variant="danger" type="button">Cerrar sesión</button>

<!-- Tamaños: sm (30px) · md (38px, por defecto) · lg (44px) -->
<button appButton size="lg" [block]="true" type="submit" [disabled]="form.invalid">
  Continuar
</button>

<!-- También sobre enlaces -->
<a appButton variant="secondary" routerLink="/catalogo">Ver catálogo</a>`,

  input: `import { UiInput } from '../../../../shared/ui';   // imports: [UiInput, ReactiveFormsModule]

<app-ui-input label="Correo electrónico" type="email" placeholder="tu@correo.com"
  autocomplete="email" [formControl]="email" />

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

<app-ui-checkbox [formControl]="acepta">
  Acepto los términos y condiciones
</app-ui-checkbox>`,

  badge: `import { UiBadge } from '../../../../shared/ui';   // imports: [UiBadge]

<!-- tone: success · warning · info · danger · neutral -->
<app-ui-badge tone="success">Pagado</app-ui-badge>
<app-ui-badge tone="warning">Pendiente</app-ui-badge>
<app-ui-badge tone="info">En camino</app-ui-badge>
<app-ui-badge tone="danger">Rechazado</app-ui-badge>
<app-ui-badge tone="neutral">Sin stock</app-ui-badge>

<!-- Con icono: el svg va como contenido -->
<app-ui-badge tone="success">
  <svg width="10" height="10" …></svg>
  Entregado
</app-ui-badge>`,

  alert: `import { UiAlert } from '../../../../shared/ui';   // imports: [UiAlert]

<!-- tone: success · info · warning · danger. El icono va como contenido -->
<app-ui-alert tone="success">
  <svg width="14" height="14" … class="shrink-0"></svg>
  <p>Entrega estimada: <strong>2–3 días hábiles</strong></p>
</app-ui-alert>

<app-ui-alert tone="warning">
  <svg width="13" height="13" … class="shrink-0"></svg>
  <p>Tu pedido quedará reservado. El pago se realiza al momento de la entrega.</p>
</app-ui-alert>

<!-- Error de formulario (login / registro) -->
@if (error()) {
  <app-ui-alert tone="danger">{{ error() }}</app-ui-alert>
}`,

  card: `import { UiCard } from '../../../../shared/ui';   // imports: [UiCard]

<!-- variant: default · danger · interactive   |   padding: none · sm · md
     Es flex en columna: el espaciado interno va con class="gap-4" -->
<app-ui-card>…contenido…</app-ui-card>
<app-ui-card variant="danger">Zona de riesgo</app-ui-card>
<app-ui-card variant="interactive" padding="none">…card de producto…</app-ui-card>`,

  modal: `import { UiModal, UiButton } from '../../../../shared/ui';   // imports: [UiModal, UiButton]

abierto = signal(false);

<button appButton type="button" (click)="abierto.set(true)">Abrir modal</button>

@if (abierto()) {
  <app-ui-modal title="Nueva dirección" (closed)="abierto.set(false)">
    …contenido del modal…
    <div slot="footer" class="flex gap-3">
      <button appButton variant="secondary" type="button" (click)="abierto.set(false)">Cancelar</button>
      <button appButton type="button" (click)="guardar()">Guardar</button>
    </div>
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
