import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CatalogoCategorias } from '../../../modules/catalogo/services/catalogo-categorias';
import { Icon } from '../icon/icon';

/** Footer de la tienda (prototipo del portal cliente). */
@Component({
  selector: 'app-footer',
  imports: [NgOptimizedImage, RouterLink, Icon],
  host: { class: 'block' },
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly anio = new Date().getFullYear();
  /** Las categorías llevan al catálogo filtrado por ellas (`?categoria=`). */
  protected readonly categorias = inject(CatalogoCategorias).lista;

  protected readonly navegacion = [
    { label: 'Nosotros', ruta: '/nosotros' },
    { label: 'Catálogo', ruta: '/catalogo' },
    { label: 'Contacto', ruta: '/contacto' },
  ];
  protected readonly redes = [
    { label: 'f', nombre: 'Facebook' },
    { label: 'in', nombre: 'LinkedIn' },
    { label: 'ig', nombre: 'Instagram' },
  ];
}
