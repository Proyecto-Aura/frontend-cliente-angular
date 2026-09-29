import { Component, computed, inject, signal } from '@angular/core';

import { ToastService } from '../../../shared/ui/toast/toast-service';
import { UiButton, UiCard, UiInput, UiTextarea } from '../../../shared/ui';

/** Página "Contacto": formulario + datos de contacto. Hija de store-layout. */
@Component({
  selector: 'app-contacto',
  imports: [UiButton, UiCard, UiInput, UiTextarea],
  host: { class: 'block' },
  templateUrl: './contacto.html',
})
export class Contacto {
  private readonly toast = inject(ToastService);

  protected readonly nombre = signal('');
  protected readonly email = signal('');
  protected readonly asunto = signal('');
  protected readonly mensaje = signal('');
  protected readonly enviado = signal(false);

  protected readonly puedeEnviar = computed(
    () =>
      this.nombre().trim() !== '' &&
      this.email().trim() !== '' &&
      this.asunto().trim() !== '' &&
      this.mensaje().trim() !== '',
  );

  protected readonly info = [
    { title: 'Dirección', lines: ['Av. La Marina 2345', 'San Miguel, Lima, Perú'], tone: 'bg-[#fce4e4] text-brand-600' },
    { title: 'Teléfono', lines: ['(01) 234-5678', 'Lun – Vie: 8am – 6pm'], tone: 'bg-[#e2f3e6] text-success-700' },
    { title: 'Email', lines: ['hola@francos.pe', 'ventas@francos.pe'], tone: 'bg-[#e6e7fb] text-[#4f46e5]' },
    { title: 'Horario de atención', lines: ['Lunes a Viernes: 8am – 6pm', 'Sábados: 9am – 1pm'], tone: 'bg-[#fef0dc] text-[#b45309]' },
  ];

  protected readonly redes = [
    { label: 'Facebook', tone: 'bg-[#1877f2]' },
    { label: 'Instagram', tone: 'bg-[#e1306c]' },
    { label: 'LinkedIn', tone: 'bg-[#0a66c2]' },
  ];

  protected enviar(): void {
    if (!this.puedeEnviar()) return;
    this.enviado.set(true);
    this.toast.success('Mensaje enviado', 'Te responderemos en menos de 24 horas.');
  }

  protected otroMensaje(): void {
    this.enviado.set(false);
    this.nombre.set('');
    this.email.set('');
    this.asunto.set('');
    this.mensaje.set('');
  }
}
