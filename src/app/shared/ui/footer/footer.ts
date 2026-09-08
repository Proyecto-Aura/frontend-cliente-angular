import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/** Pie del storefront: marca, navegación, categorías y contacto. Equivale al Footer.tsx del portal React. */
@Component({
  selector: 'app-footer',
  imports: [NgOptimizedImage],
  host: { class: 'block' },
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly nav = ['Inicio', 'Nosotros', 'Catálogo', 'Promociones', 'Contacto'];
  protected readonly categorias = [
    'Snacks Salados',
    'Snacks Dulces',
    'Frutos Secos',
    'Promociones 3x2',
    'Novedades',
  ];
  protected readonly legal = ['Política de privacidad', 'Términos y condiciones', 'Cookies'];
  protected readonly redes = ['f', 'in', 'ig'];
}
