import { Component } from '@angular/core';

import { Icon, IconName } from '../../../shared/ui/icon/icon';

/**
 * Enlaces de los canales. Un `href` en `null` significa que aún no tenemos el dato
 * real: la fila se muestra como texto, sin enlace, en lugar de apuntar a ninguna parte.
 */
const ENLACES = {
  telefono: 'tel:+5113881888', // (01) es el código de Lima: +51 1.
  whatsapp: null,
  correoInfo: 'mailto:info@snacksfrancos.com',
  correoVentas: 'mailto:snacks_francos@hotmail.com',
  facebook: null,
  instagram: null,
  tiktok: null,
  todosLosEnlaces: null,
  mapa:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(
      'Industrias Alimentarias Vera S.A.C., Mz. P Lt. 24 Int. 2 C.V. Santa Martha de Lima, San Juan de Lurigancho, Lima 15400',
    ),
} satisfies Record<string, string | null>;

export interface EnlaceContacto {
  texto: string;
  href: string | null;
  /** Abre en otra pestaña (redes, mapas); `tel:` y `mailto:` no lo necesitan. */
  externo?: boolean;
}

export interface CanalContacto {
  icono: IconName;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  enlaces: EnlaceContacto[];
  /** La tarjeta roja del teléfono; las demás van en blanco. */
  destacado?: boolean;
}

/** Clases de cada parte de la tarjeta: roja (destacada) o blanca. */
const ESTILOS = {
  destacado: {
    tarjeta: 'bg-brand-600 text-white',
    icono: 'bg-[#f5d300]',
    etiqueta: 'text-[#fff3a3]',
    titulo: '',
    descripcion: '',
    enlace: 'hover:text-[#fff3a3]',
    textoPlano: 'text-white',
  },
  normal: {
    tarjeta: 'border border-line bg-surface',
    icono: 'bg-danger-50',
    etiqueta: 'text-brand-600',
    titulo: 'text-ink',
    descripcion: 'text-ink-soft',
    enlace: 'text-ink hover:text-brand-600',
    textoPlano: 'text-ink-soft',
  },
};

/**
 * Página "Contacto": los canales de la empresa (teléfono, correo, redes) y su
 * ubicación. No tiene formulario: el cliente escribe o llama por el canal que
 * prefiera, así que no hace falta backend.
 */
@Component({
  selector: 'app-contacto',
  imports: [Icon],
  host: { class: 'block' },
  templateUrl: './contacto.html',
})
export class Contacto {
  protected readonly canales: CanalContacto[] = [
    {
      icono: 'phone',
      etiqueta: 'POR TELÉFONO',
      titulo: 'Llámanos',
      descripcion: 'Conversemos sobre productos y consultas comerciales.',
      enlaces: [
        { texto: '(01) 388-1888', href: ENLACES.telefono },
        { texto: 'WhatsApp', href: ENLACES.whatsapp, externo: true },
      ],
      destacado: true,
    },
    {
      icono: 'mail',
      etiqueta: 'POR CORREO',
      titulo: 'Escríbenos',
      descripcion: 'Cuéntanos qué necesitas y te responderemos.',
      enlaces: [
        { texto: 'info@snacksfrancos.com', href: ENLACES.correoInfo },
        { texto: 'snacks_francos@hotmail.com', href: ENLACES.correoVentas },
      ],
    },
    {
      icono: 'message-square',
      etiqueta: 'EN REDES',
      titulo: 'Síguenos',
      descripcion: 'Descubre más sabores y novedades de la marca.',
      enlaces: [
        { texto: 'Facebook', href: ENLACES.facebook, externo: true },
        { texto: 'Instagram', href: ENLACES.instagram, externo: true },
        { texto: 'TikTok', href: ENLACES.tiktok, externo: true },
        { texto: 'Ver todos nuestros enlaces', href: ENLACES.todosLosEnlaces, externo: true },
      ],
    },
  ];

  protected readonly mapa = ENLACES.mapa;

  protected estilo(canal: CanalContacto): (typeof ESTILOS)['normal'] {
    return canal.destacado ? ESTILOS.destacado : ESTILOS.normal;
  }
}
