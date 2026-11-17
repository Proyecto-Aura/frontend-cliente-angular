import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { CarritoAgregar } from '../../../carrito/components/carrito-agregar/carrito-agregar';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import {
  CatalogoFilterDropdown,
  OpcionFiltro,
} from '../../components/catalogo-filter-dropdown/catalogo-filter-dropdown';
import { CatalogoProductCard } from '../../components/catalogo-product-card/catalogo-product-card';
import { CatalogoProductDetail } from '../../components/catalogo-product-detail/catalogo-product-detail';
import { OrdenCatalogo, ProductoCatalogo } from '../../models/catalogo.model';
import { CatalogoApi } from '../../services/catalogo-api';
import { CatalogoCategorias } from '../../services/catalogo-categorias';
import { PARAM, agruparPorProducto, filtrosDesdeQuery } from '../../utils/catalogo.utils';

type Filtro = 'categoria' | 'orden';

/**
 * HU-B-005: catálogo de productos activos. La búsqueda (desde el header), la
 * categoría y el orden por precio viven en la URL y los resuelve el backend.
 */
@Component({
  selector: 'app-listar-productos',
  imports: [
    RouterLink,
    Icon,
    CatalogoFilterDropdown,
    CatalogoProductCard,
    CatalogoProductDetail,
    CarritoAgregar,
  ],
  host: { class: 'block bg-[#f7f7f7]' },
  templateUrl: './listar-productos.html',
})
export class ListarProductos {
  private readonly api = inject(CatalogoApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly query = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly filtros = computed(() => filtrosDesdeQuery(this.query()));
  protected readonly filtroAbierto = signal<Filtro | null>(null);
  /** Producto abierto en el modal "Ver detalle". */
  protected readonly detalleId = signal<number | null>(null);
  /** Producto abierto en la ventana "Agregar" (HU-B-006). */
  protected readonly agregando = signal<{
    producto: ProductoCatalogo;
    presentacionId: number;
  } | null>(null);

  private readonly categorias = inject(CatalogoCategorias).lista;
  protected readonly opcionesCategoria = computed<OpcionFiltro<number>[]>(() =>
    this.categorias().map((c) => ({ valor: c.id, label: c.nombre })),
  );
  protected readonly opcionesOrden: OpcionFiltro<OrdenCatalogo>[] = [
    { valor: 'precio_asc', label: 'Precio: menor a mayor' },
    { valor: 'precio_desc', label: 'Precio: mayor a menor' },
  ];

  protected readonly items = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.api.listar(params),
  });

  protected readonly productos = computed(() =>
    this.items.hasValue() ? agruparPorProducto(this.items.value()) : [],
  );
  protected readonly hayFiltros = computed(() => {
    const { q, categoriaId, orden } = this.filtros();
    return !!q || categoriaId !== null || orden !== null;
  });
  protected readonly mensajeError = computed(() =>
    apiErrorMessage(this.items.error(), 'No pudimos cargar el catálogo. Inténtalo de nuevo.'),
  );

  protected alternar(filtro: Filtro): void {
    this.filtroAbierto.update((abierto) => (abierto === filtro ? null : filtro));
  }

  protected elegirCategoria(id: number | null): void {
    this.cambiar({ [PARAM.categoria]: id });
  }

  protected elegirOrden(orden: OrdenCatalogo | null): void {
    this.cambiar({ [PARAM.orden]: orden });
  }

  protected limpiarFiltros(): void {
    this.filtroAbierto.set(null);
    void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  private cambiar(params: Params): void {
    this.filtroAbierto.set(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
