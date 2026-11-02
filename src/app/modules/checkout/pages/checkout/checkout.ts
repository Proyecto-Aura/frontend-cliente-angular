import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  EMPTY,
  Observable,
  catchError,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { Icon } from '../../../../shared/ui/icon/icon';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { CarritoStore } from '../../../carrito/services/carrito-store';
import { PerfilStore } from '../../../cuenta/services/perfil-store';
import { CheckoutCliente } from '../../components/checkout-cliente/checkout-cliente';
import { CheckoutCulqi } from '../../components/checkout-culqi/checkout-culqi';
import { CheckoutDireccion } from '../../components/checkout-direccion/checkout-direccion';
import { CheckoutPago } from '../../components/checkout-pago/checkout-pago';
import { CheckoutResumen } from '../../components/checkout-resumen/checkout-resumen';
import { CheckoutStepper, PasoCheckout } from '../../components/checkout-stepper/checkout-stepper';
import { ResumenPedido } from '../../models/checkout.model';
import { CheckoutApi } from '../../services/checkout-api';
import { firmaDelPedido, itemsDelPedido, lineasDelPedido } from '../../utils/checkout.utils';

/**
 * HU-B-007 (RF-B20 a RF-B23): el cliente confirma su carrito corroborando la
 * dirección de entrega predeterminada (puede deshacer la confirmación para
 * cambiarla) y ve el subtotal y el total que calcula el servidor, con el precio
 * mayorista cuando la cantidad supera el umbral (RN17). Con la dirección
 * confirmada el cliente paga (HU-B-008): el servidor cobra con el token de
 * Culqi y solo si el pago se confirma crea el pedido (RN5). Si lo rechazan, no
 * se crea nada y puede reintentar sin salir de la ventana de pago.
 */
@Component({
  selector: 'app-checkout',
  imports: [
    RouterLink,
    Icon,
    CheckoutStepper,
    CheckoutCliente,
    CheckoutDireccion,
    CheckoutPago,
    CheckoutResumen,
    CheckoutCulqi,
  ],
  host: { class: 'block min-h-[calc(100vh-64px)] bg-[#f7f7f7]' },
  templateUrl: './checkout.html',
})
export class Checkout {
  protected readonly carrito = inject(CarritoStore);
  protected readonly perfil = inject(PerfilStore);
  private readonly api = inject(CheckoutApi);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resumen = signal<ResumenPedido | null>(null);
  /** La dirección ya confirmada (con su referencia), o `null` si falta confirmar. */
  protected readonly direccionConfirmada = signal<string | null>(null);
  protected readonly confirmando = signal(false);
  protected readonly errorDireccion = signal<string | null>(null);
  private readonly intentos = signal(0);

  /** La ventana "Pagar con Culqi" está abierta. */
  protected readonly pagoAbierto = signal(false);
  protected readonly pagando = signal(false);
  /** Motivo del último pago rechazado (RF-B26). */
  protected readonly errorPago = signal<string | null>(null);

  /** Hay al menos un producto que se puede comprar. */
  protected readonly hayProductos = computed(() => itemsDelPedido(this.carrito.items()).length > 0);
  protected readonly noDisponibles = computed(
    () => this.carrito.items().filter((i) => !i.disponible).length,
  );
  protected readonly lineas = computed(() => lineasDelPedido(this.carrito.items(), this.resumen()));
  protected readonly paso = computed<PasoCheckout>(() => (this.direccionConfirmada() ? 3 : 2));

  /** Cambia cuando el cliente modifica lo que va a comprar o pide reintentar. */
  private readonly disparador = computed(
    () => `${firmaDelPedido(this.carrito.items())}#${this.intentos()}`,
  );

  constructor() {
    const cambios$ = toObservable(this.disparador);
    // Primero se actualizan precios y stock del carrito; luego se pide el resumen
    // y se vuelve a pedir cada vez que cambia el contenido del carrito (la última
    // respuesta gana). Se lee el valor vigente y no el emitido, que puede ir un
    // ciclo atrasado, y se descartan los repetidos para no consultar dos veces.
    this.carrito
      .refrescar()
      .pipe(
        switchMap(() =>
          cambios$.pipe(
            map(() => this.disparador()),
            startWith(this.disparador()),
            distinctUntilChanged(),
          ),
        ),
        switchMap(() => this.consultar()),
        takeUntilDestroyed(),
      )
      .subscribe();

    // Nombre y teléfono del perfil: si no se pueden traer, el resumen sigue funcionando.
    if (!this.perfil.perfil()) {
      this.perfil
        .cargar()
        .pipe(
          catchError(() => EMPTY),
          takeUntilDestroyed(),
        )
        .subscribe();
    }
  }

  protected reintentar(): void {
    this.intentos.update((n) => n + 1);
  }

  protected abrirCarrito(): void {
    this.carrito.abierto.set(true);
  }

  /** "Confirmar dirección": el servidor valida el pedido con esa dirección de entrega. */
  protected confirmarDireccion(direccion: string): void {
    if (this.confirmando()) return;
    this.confirmando.set(true);
    this.errorDireccion.set(null);
    this.api
      .resumir({
        items: itemsDelPedido(this.carrito.items()),
        tipo_entrega: 'delivery',
        direccion_entrega: direccion,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resumen) => {
          this.resumen.set(resumen);
          this.direccionConfirmada.set(resumen.direccion_entrega ?? direccion);
          this.confirmando.set(false);
          this.avisos.mostrar('Dirección confirmada', 'La usaremos para entregar tu pedido.');
        },
        error: (err: unknown) => {
          this.errorDireccion.set(
            apiErrorMessage(err, 'No pudimos confirmar la dirección. Inténtalo de nuevo.'),
          );
          this.confirmando.set(false);
        },
      });
  }

  protected abrirPago(): void {
    if (!this.direccionConfirmada() || this.pagando()) return;
    this.errorPago.set(null);
    this.pagoAbierto.set(true);
  }

  protected cerrarPago(): void {
    if (this.pagando()) return;
    this.pagoAbierto.set(false);
    this.errorPago.set(null);
  }

  /**
   * Cobra el carrito con el token de Culqi (RF-B24). Si se confirma, se muestra
   * la pantalla del pedido pagado y se sacan del carrito solo las líneas
   * pagadas (RF-B26, RF-B28). Si se rechaza, la ventana sigue abierta con el
   * motivo para reintentar: el servidor no guardó ningún pedido (RF-B27).
   */
  protected pagar(token: string): void {
    const direccion = this.direccionConfirmada();
    if (!direccion || this.pagando()) return;
    this.pagando.set(true);
    this.errorPago.set(null);
    this.api
      .pagar({
        items: itemsDelPedido(this.carrito.items()),
        tipo_entrega: 'delivery',
        direccion_entrega: direccion,
        culqi_token: token,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pedido) => {
          this.avisos.mostrar('Pago confirmado', `Tu pedido ${pedido.codigo} está pagado.`);
          void this.router.navigate(['/checkout/exito'], { state: { pedido } }).then(() => {
            pedido.items.forEach((i) => this.carrito.eliminar(i.producto_presentacion_id));
          });
        },
        error: (err: unknown) => {
          this.errorPago.set(
            apiErrorMessage(err, 'No pudimos procesar tu pago. Inténtalo de nuevo.'),
          );
          this.pagando.set(false);
        },
      });
  }

  /** "Deshacer": cancela la confirmación para poder cambiar la dirección. */
  protected deshacerDireccion(): void {
    this.direccionConfirmada.set(null);
    this.errorDireccion.set(null);
  }

  /**
   * Pide el resumen con lo que hay en el carrito. Sin dirección confirmada se
   * pide como recojo en tienda: así el servidor devuelve los montos y la
   * dirección del perfil sin exigir una (el perfil puede no tenerla).
   */
  private consultar(): Observable<void> {
    this.error.set(null);
    const items = itemsDelPedido(this.carrito.items());
    if (!items.length) {
      this.resumen.set(null);
      this.cargando.set(false);
      return of(undefined);
    }
    if (!this.resumen()) this.cargando.set(true);

    const direccion = this.direccionConfirmada();
    return this.api
      .resumir(
        direccion
          ? { items, tipo_entrega: 'delivery', direccion_entrega: direccion }
          : { items, tipo_entrega: 'recojo_tienda' },
      )
      .pipe(
        tap((resumen) => {
          this.resumen.set(resumen);
          this.cargando.set(false);
        }),
        map(() => undefined),
        catchError((err: unknown) => {
          this.error.set(apiErrorMessage(err, 'No pudimos calcular tu pedido.'));
          this.cargando.set(false);
          return of(undefined);
        }),
      );
  }
}
