import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ConfirmDialog,
  ToastService,
  UiAlert,
  UiBadge,
  UiButton,
  UiCard,
  UiCheckbox,
  UiInput,
  UiModal,
  UiQuantity,
  UiSelect,
  UiSelectOption,
  UiStepProgress,
  UiTextarea,
} from '../../../../shared/ui';
import { ShowcaseSection } from '../../components/showcase-section/showcase-section';
import { SNIPPETS } from './showcase.snippets';

/**
 * Catálogo vivo del design system del portal: tokens de `styles.css` y cada
 * primitiva de `shared/ui` con sus variantes y el código listo para copiar.
 */
@Component({
  selector: 'app-showcase',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    ShowcaseSection,
    ConfirmDialog,
    UiAlert,
    UiBadge,
    UiButton,
    UiCard,
    UiCheckbox,
    UiInput,
    UiModal,
    UiQuantity,
    UiSelect,
    UiStepProgress,
    UiTextarea,
  ],
  host: { class: 'flex min-h-screen bg-background' },
  templateUrl: './showcase.html',
})
export class Showcase {
  protected readonly toast = inject(ToastService);
  protected readonly code = SNIPPETS;

  protected readonly sections = [
    { id: 'tokens', label: 'Colores y tipografía' },
    { id: 'button', label: 'Button' },
    { id: 'input', label: 'Input' },
    { id: 'select', label: 'Select' },
    { id: 'textarea', label: 'Textarea' },
    { id: 'checkbox', label: 'Checkbox' },
    { id: 'badge', label: 'Badge' },
    { id: 'alert', label: 'Alert' },
    { id: 'card', label: 'Card' },
    { id: 'modal', label: 'Modal' },
    { id: 'confirm', label: 'Confirm dialog' },
    { id: 'toast', label: 'Toast' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'step-progress', label: 'Step progress' },
  ] as const;

  protected readonly colorGroups = [
    {
      title: 'Marca y estados',
      colors: [
        { name: 'primary', hex: '#D22B2B', note: 'botones, links, foco' },
        { name: 'primary-hover', hex: '#B92525' },
        { name: 'primary-active', hex: '#A32020' },
        { name: 'accent', hex: 'rgba(210,43,43,0.08)', note: 'hover de ítems' },
        { name: 'destructive', hex: '#E53935' },
      ],
    },
    {
      title: 'Neutros',
      colors: [
        { name: 'white', hex: '#FFFFFF', note: 'cards, inputs' },
        { name: 'background', hex: '#F5F5F5', note: 'fondo de página' },
        { name: 'border', hex: '#E0E0E0', note: 'bordes y divisores' },
        { name: 'muted-foreground', hex: '#757575', note: 'texto secundario' },
        { name: 'foreground', hex: '#212121', note: 'texto' },
      ],
    },
    {
      title: 'Semánticos',
      colors: [
        { name: 'success', hex: '#43A047' },
        { name: 'warning', hex: '#FB8C00' },
        { name: 'destructive', hex: '#E53935' },
        { name: 'info', hex: '#1E88E5' },
      ],
    },
  ];

  /** Escala tipográfica del DS (Inter, base 14px, interlineado 1.5). */
  protected readonly typeScale = [
    { size: 26, weight: 600, label: '26 · KPI', sample: 'S/ 148,320' },
    { size: 21, weight: 500, label: '21 · Título de página', sample: 'Mis pedidos' },
    { size: 18, weight: 500, label: '18 · Título de sección', sample: 'Datos personales' },
    { size: 16, weight: 500, label: '16 · Título de card', sample: 'Resumen del pedido' },
    { size: 14, weight: 400, label: '14 · Cuerpo e inputs', sample: 'Ingresa con tu cuenta' },
    { size: 12, weight: 400, label: '12 · Leyendas', sample: '240 registros · actualizado hace 2 h' },
    { size: 11, weight: 500, label: '11 · Overline', sample: 'OPERACIÓN' },
  ];

  // --- Demos de formulario ---
  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly dni = new FormControl('123', {
    nonNullable: true,
    validators: [Validators.pattern(/^\d{8}$/)],
  });
  protected readonly disabledInput = new FormControl({ value: 'No editable', disabled: true });
  protected readonly distrito = new FormControl('', { nonNullable: true });
  protected readonly motivo = new FormControl('', { nonNullable: true });
  protected readonly acepta = new FormControl(false, { nonNullable: true });

  protected readonly distritos: UiSelectOption[] = [
    { value: 'miraflores', label: 'Miraflores' },
    { value: 'san-isidro', label: 'San Isidro' },
    { value: 'surco', label: 'Santiago de Surco' },
    { value: 'barranco', label: 'Barranco' },
  ];

  // --- Demos interactivas ---
  protected readonly modalOpen = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly cantidad = signal(1);
  protected readonly paso = signal(1);

  constructor() {
    this.dni.markAsTouched();
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
