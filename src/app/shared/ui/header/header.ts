import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthApi } from '../../../modules/auth/services/auth-api';
import { CarritoStore } from '../../../modules/carrito/services/carrito-store';
import { Session } from '../../auth/session';
import { Icon } from '../icon/icon';

/** Espera tras la última tecla antes de buscar. */
export const ESPERA_BUSQUEDA_MS = 300;

/**
 * Header de la tienda (prototipo del portal cliente): marca, menú, buscador
 * del catálogo, carrito con su contador (HU-B-006) y "Mi cuenta". El resto del
 * menú de la cuenta llega con sus HU.
 */
@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, Icon],
  host: {
    class:
      'sticky top-0 z-40 block bg-[linear-gradient(90deg,#d32f2f_0%,#c62828_100%)] shadow-[0_2px_12px_rgba(120,10,10,0.18)]',
  },
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  protected readonly session = inject(Session);
  protected readonly carrito = inject(CarritoStore);

  protected readonly navItems = [
    { label: 'Nosotros', ruta: '/nosotros' },
    { label: 'Catálogo', ruta: '/catalogo' },
    { label: 'Contacto', ruta: '/contacto' },
  ];

  protected readonly menuAbierto = signal(false);
  protected readonly cerrando = signal(false);
  private readonly authApi = inject(AuthApi);

  /** Búsqueda de la URL del catálogo, para que el campo la refleje. */
  protected readonly busqueda = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.qDeLaUrl()),
    ),
    { initialValue: this.qDeLaUrl() },
  );
  protected readonly enCatalogo = computed(() => this.busqueda() !== null);

  private espera: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.espera));
  }

  /** HU-B-004: cierra la sesión y lleva al login. */
  protected cerrarSesion(): void {
    this.cerrando.set(true);
    this.authApi.cerrarSesion().subscribe(() => {
      this.cerrando.set(false);
      this.menuAbierto.set(false);
      void this.router.navigate(['/auth/login'], { replaceUrl: true });
    });
  }

  protected abrirCarrito(): void {
    this.menuAbierto.set(false);
    this.carrito.abierto.set(true);
  }

  /** Busca en el catálogo cuando se deja de escribir (lleva al catálogo si hace falta). */
  protected buscar(texto: string): void {
    clearTimeout(this.espera);
    this.espera = setTimeout(() => {
      const q = texto.trim() || null;
      void this.router.navigate(['/catalogo'], {
        queryParams: { q },
        queryParamsHandling: 'merge',
        replaceUrl: this.enCatalogo(),
      });
    }, ESPERA_BUSQUEDA_MS);
  }

  /** `q` de la URL si se está en el catálogo; `null` fuera de él. */
  private qDeLaUrl(): string | null {
    const url = this.router.parseUrl(this.router.url);
    const ruta = url.root.children['primary']?.segments.map((s) => s.path) ?? [];
    return ruta[0] === 'catalogo' ? (url.queryParamMap.get('q') ?? '') : null;
  }
}
