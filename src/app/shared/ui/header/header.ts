import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CarritoStore } from '../../../modules/carrito/services/carrito-store';

/**
 * Barra superior del storefront: logo, navegación, buscador, carrito (con badge)
 * y acceso a "Mi cuenta". Equivale al Header.tsx del portal React.
 */
@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  host: { class: 'block' },
  templateUrl: './header.html',
})
export class Header {
  protected readonly carrito = inject(CarritoStore);

  protected readonly navLinks = [
    { label: 'Nosotros', path: '/nosotros' },
    { label: 'Catálogo', path: '/catalogo' },
    { label: 'Contacto', path: '/contacto' },
  ] as const;
}
