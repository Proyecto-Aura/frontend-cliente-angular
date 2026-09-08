import { Injectable, computed, effect, signal } from '@angular/core';

import { Producto } from '../../catalogo/models/producto.model';
import { ItemCarrito } from '../models/item-carrito.model';

const STORAGE_KEY = 'francos-carrito';

/**
 * Estado global del carrito (equivalente al CartProvider del portal React).
 * Signals + persistencia en localStorage. `providedIn: 'root'` → una sola
 * instancia para toda la app; el Header muestra el badge desde aquí.
 */
@Injectable({ providedIn: 'root' })
export class CarritoStore {
  private readonly _items = signal<ItemCarrito[]>(this.read());

  readonly items = this._items.asReadonly();
  readonly totalItems = computed(() => this._items().reduce((acc, e) => acc + e.qty, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((acc, e) => acc + e.product.price * e.qty, 0),
  );

  constructor() {
    // Cada cambio de items se vuelca a localStorage.
    effect(() => this.write(this._items()));
  }

  addItem(product: Producto, qty = 1): void {
    this._items.update((prev) => {
      const found = prev.find((e) => e.product.id === product.id);
      return found
        ? prev.map((e) => (e.product.id === product.id ? { ...e, qty: e.qty + qty } : e))
        : [...prev, { product, qty }];
    });
  }

  changeQty(productId: number, delta: number): void {
    this._items.update((prev) =>
      prev.map((e) => (e.product.id === productId ? { ...e, qty: Math.max(1, e.qty + delta) } : e)),
    );
  }

  removeItem(productId: number): void {
    this._items.update((prev) => prev.filter((e) => e.product.id !== productId));
  }

  getQty(productId: number): number {
    return this._items().find((e) => e.product.id === productId)?.qty ?? 0;
  }

  clear(): void {
    this._items.set([]);
  }

  private read(): ItemCarrito[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
    } catch {
      return [];
    }
  }

  private write(items: ItemCarrito[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: el carrito vive solo en memoria */
    }
  }
}
