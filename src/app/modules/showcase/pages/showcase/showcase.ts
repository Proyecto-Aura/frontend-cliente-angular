import { Component, inject, signal } from '@angular/core';
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
  host: { class: 'block min-h-full bg-canvas' },
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
      title: 'Marca',
      colors: [
        { name: 'brand-50', hex: '#fff5f5' },
        { name: 'brand-100', hex: '#ffe2e2' },
        { name: 'brand-400', hex: '#ef4444' },
        { name: 'brand-500', hex: '#dc2626' },
        { name: 'brand-600', hex: '#d22b2b', note: 'primario' },
        { name: 'brand-700', hex: '#b91c1c', note: 'hover' },
        { name: 'brand-800', hex: '#991b1b', note: 'active' },
      ],
    },
    {
      title: 'Neutros',
      colors: [
        { name: 'ink', hex: '#212121', note: 'texto fuerte' },
        { name: 'label', hex: '#424242', note: 'labels' },
        { name: 'ink-soft', hex: '#616161', note: 'secundario' },
        { name: 'muted', hex: '#9e9e9e', note: 'tenue' },
        { name: 'line', hex: '#bdbdbd', note: 'bordes' },
        { name: 'line-soft', hex: '#e0e0e0', note: 'separadores' },
        { name: 'surface', hex: '#ffffff' },
        { name: 'canvas', hex: '#f9f9f9', note: 'fondo' },
      ],
    },
    {
      title: 'Semánticos',
      colors: [
        { name: 'success-50', hex: '#f0fdf4' },
        { name: 'success-600', hex: '#16a34a' },
        { name: 'success-700', hex: '#15803d' },
        { name: 'warning-600', hex: '#f59e0b' },
        { name: 'info-50', hex: '#e3f2fd' },
        { name: 'info-600', hex: '#1565c0' },
      ],
    },
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
