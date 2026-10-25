import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { Session } from '../../../shared/auth/session';
import { PresentacionCatalogo, ProductoCatalogo } from '../../catalogo/models/catalogo.model';
import { CatalogoApi } from '../../catalogo/services/catalogo-api';
import { etiquetaPresentacion, etiquetaPromocion } from '../../catalogo/utils/catalogo.utils';
import { CarritoGuardado, ItemCarrito } from '../models/carrito.model';

const CLAVE = 'francos.carrito';
const MS_POR_DIA = 24 * 60 * 60 * 1000;
/** El carrito se vacía si pasa una semana sin que el cliente lo toque. */
export const DIAS_VIGENCIA_CARRITO = 7;
export const CANTIDAD_MAXIMA = 99;

/**
 * Carrito del portal (HU-B-006). Vive solo en el navegador (localStorage): no
 * hay tablas de carrito; se convierte en pedido al confirmarlo (HU-B-007). Se
 * vacía al cerrar sesión, para no dejarlo a la vista en una computadora
 * compartida.
 */
@Injectable({ providedIn: 'root' })
export class CarritoStore {
  private readonly api = inject(CatalogoApi);
  private readonly session = inject(Session);

  private readonly _items = signal<ItemCarrito[]>(this.leer());
  readonly items = this._items.asReadonly();
  /** Panel lateral "Tu carrito". */
  readonly abierto = signal(false);

  private readonly disponibles = computed(() => this._items().filter((i) => i.disponible));
  /** Unidades en el carrito (el contador del header). */
  readonly unidades = computed(() => this._items().reduce((n, i) => n + i.cantidad, 0));
  readonly subtotal = computed(() =>
    this.disponibles().reduce((s, i) => s + i.precio * i.cantidad, 0),
  );
  readonly descuento = computed(() =>
    this.disponibles().reduce((s, i) => s + (i.precio - i.precioFinal) * i.cantidad, 0),
  );
  readonly total = computed(() => this.subtotal() - this.descuento());

  constructor() {
    let conSesion = this.session.isAuthenticated();
    effect(() => {
      const ahora = this.session.isAuthenticated();
      if (conSesion && !ahora) this.vaciar();
      conSesion = ahora;
    });
  }

  /** Agrega la presentación (o suma a la línea que ya existe). No agrega lo agotado. */
  agregar(
    producto: ProductoCatalogo,
    presentacion: PresentacionCatalogo,
    cantidad: number,
  ): boolean {
    if (!presentacion.disponible) return false;
    const actual = this._items().find((i) => i.presentacionId === presentacion.id);
    const nueva = limitar((actual?.cantidad ?? 0) + cantidad);
    const item = { ...aItem(producto, presentacion), cantidad: nueva };
    this.guardar(
      actual
        ? this._items().map((i) => (i.presentacionId === presentacion.id ? item : i))
        : [...this._items(), item],
    );
    return true;
  }

  cambiarCantidad(presentacionId: number, cantidad: number): void {
    this.guardar(
      this._items().map((i) =>
        i.presentacionId === presentacionId ? { ...i, cantidad: limitar(cantidad) } : i,
      ),
    );
  }

  eliminar(presentacionId: number): void {
    this.guardar(this._items().filter((i) => i.presentacionId !== presentacionId));
  }

  vaciar(): void {
    this._items.set([]);
    escribir(null);
  }

  /**
   * Trae precio, promoción y stock vigentes de cada producto del carrito. Si
   * un producto ya no se vende (404), sus líneas quedan como no disponibles;
   * ante otros errores se deja lo que había.
   */
  refrescar(): Observable<void> {
    const ids = [...new Set(this._items().map((i) => i.productoId))];
    if (!ids.length) return of(undefined);
    return forkJoin(
      ids.map((id) =>
        this.api.obtener(id).pipe(
          catchError((err: unknown) =>
            of(err instanceof HttpErrorResponse && err.status === 404 ? null : undefined),
          ),
          map((producto) => [id, producto] as const),
        ),
      ),
    ).pipe(
      map((resultados) => {
        const productos = new Map(resultados);
        this._items.update((items) =>
          items.map((item) => {
            const producto = productos.get(item.productoId);
            if (producto === undefined) return item;
            const presentacion = producto?.presentaciones.find((p) => p.id === item.presentacionId);
            return presentacion
              ? { ...aItem(producto!, presentacion), cantidad: item.cantidad }
              : { ...item, disponible: false };
          }),
        );
        // Refrescar no es actividad del cliente: no renueva la vigencia.
        escribir({ actualizado: leerGuardado()?.actualizado ?? Date.now(), items: this._items() });
      }),
    );
  }

  private guardar(items: ItemCarrito[]): void {
    this._items.set(items);
    escribir(items.length ? { actualizado: Date.now(), items } : null);
  }

  /** El carrito guardado, si no venció. */
  private leer(): ItemCarrito[] {
    const guardado = leerGuardado();
    if (!guardado) return [];
    if (Date.now() - guardado.actualizado > DIAS_VIGENCIA_CARRITO * MS_POR_DIA) {
      escribir(null);
      return [];
    }
    return guardado.items;
  }
}

function aItem(producto: ProductoCatalogo, p: PresentacionCatalogo): Omit<ItemCarrito, 'cantidad'> {
  return {
    presentacionId: p.id,
    productoId: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria.nombre,
    presentacion: etiquetaPresentacion(p),
    imagenUrl: p.imagen_url,
    precio: p.precio,
    precioFinal: p.precio_final,
    promocion: p.promocion ? etiquetaPromocion(p.promocion) : null,
    disponible: p.disponible,
  };
}

function limitar(cantidad: number): number {
  return Math.min(CANTIDAD_MAXIMA, Math.max(1, Math.trunc(cantidad) || 1));
}

function leerGuardado(): CarritoGuardado | null {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as CarritoGuardado | null;
    return guardado && Array.isArray(guardado.items) && typeof guardado.actualizado === 'number'
      ? guardado
      : null;
  } catch {
    return null;
  }
}

function escribir(guardado: CarritoGuardado | null): void {
  try {
    if (guardado) localStorage.setItem(CLAVE, JSON.stringify(guardado));
    else localStorage.removeItem(CLAVE);
  } catch {
    /* almacenamiento no disponible: el carrito vive solo en memoria */
  }
}
