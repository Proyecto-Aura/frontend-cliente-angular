import { Component, computed, inject, signal } from '@angular/core';

import { CatalogoApi } from '../../services/catalogo-api';
import { Producto } from '../../models/producto.model';
import { CatalogoFilterDropdown } from '../../components/catalogo-filter-dropdown/catalogo-filter-dropdown';
import { CatalogoProductCard } from '../../components/catalogo-product-card/catalogo-product-card';

/** Vista de catálogo: filtros + grilla de productos. Hija de store-layout. */
@Component({
  selector: 'app-listar-productos',
  imports: [CatalogoFilterDropdown, CatalogoProductCard],
  host: { class: 'block' },
  templateUrl: './listar-productos.html',
})
export class ListarProductos {
  private readonly api = inject(CatalogoApi);

  protected readonly categorias = this.api.categorias;
  protected readonly presentaciones = this.api.presentaciones;
  protected readonly ordenamientos = this.api.ordenamientos;

  protected readonly filtroCategoria = signal(this.categorias[0]);
  protected readonly filtroPresentacion = signal(this.presentaciones[0]);
  protected readonly orden = signal(this.ordenamientos[0]);

  /** Producto abierto en el modal de detalle (lo consume feature/Ver-detalle-producto). */
  protected readonly detalle = signal<Producto | null>(null);

  private readonly productos = signal<Producto[]>(this.api.listarProductos());

  protected readonly filtrados = computed(() => {
    const cat = this.filtroCategoria();
    const pres = this.filtroPresentacion();
    const orden = this.orden();

    const lista = this.productos().filter(
      (p) =>
        (cat === this.categorias[0] || p.category === cat) &&
        (pres === this.presentaciones[0] || p.weight === pres),
    );

    if (orden === 'Precio: menor a mayor') return [...lista].sort((a, b) => a.price - b.price);
    if (orden === 'Precio: mayor a menor') return [...lista].sort((a, b) => b.price - a.price);
    return lista;
  });

  protected readonly hayFiltros = computed(
    () =>
      this.filtroCategoria() !== this.categorias[0] ||
      this.filtroPresentacion() !== this.presentaciones[0] ||
      this.orden() !== this.ordenamientos[0],
  );

  protected limpiarFiltros(): void {
    this.filtroCategoria.set(this.categorias[0]);
    this.filtroPresentacion.set(this.presentaciones[0]);
    this.orden.set(this.ordenamientos[0]);
  }
}
