import { ItemCarrito } from '../../carrito/models/carrito.model';
import {
  ComprobanteRequest,
  ItemResumenRequest,
  LineaPedido,
  MedioPago,
  ResumenPedido,
  TipoComprobante,
} from '../models/checkout.model';

/** Largo mínimo de una dirección con sentido ("Av. 1"), como en el prototipo. */
export const DIRECCION_MINIMA = 6;
/** El backend rechaza una dirección de entrega de más de 255 caracteres. */
export const DIRECCION_MAXIMA = 255;
export const REFERENCIA_MAXIMA = 100;

/** Lo que se envía al servidor: solo las líneas que se pueden comprar. */
export function itemsDelPedido(items: ItemCarrito[]): ItemResumenRequest[] {
  return items
    .filter((i) => i.disponible)
    .map((i) => ({ producto_presentacion_id: i.presentacionId, cantidad: i.cantidad }));
}

/**
 * Identifica el contenido comprable del carrito (qué presentaciones y cuántas):
 * cambia cuando hay que volver a calcular el resumen, y no con el precio.
 */
export function firmaDelPedido(items: ItemCarrito[]): string {
  return itemsDelPedido(items)
    .map((i) => `${i.producto_presentacion_id}:${i.cantidad}`)
    .join(',');
}

/** Dirección y referencia como un solo texto, que es lo que guarda el pedido. */
export function componerDireccion(direccion: string, referencia: string): string {
  const base = direccion.trim();
  const ref = referencia.trim();
  return ref ? `${base} · Ref: ${ref}` : base;
}

/** Mensaje de error de la dirección, o `null` si se puede confirmar. */
export function errorDeDireccion(direccion: string, referencia: string): string | null {
  if (direccion.trim().length < DIRECCION_MINIMA) return 'Ingresa la dirección de entrega.';
  if (componerDireccion(direccion, referencia).length > DIRECCION_MAXIMA) {
    return 'La dirección y la referencia son demasiado largas.';
  }
  return null;
}

/** Une lo calculado por el servidor con el nombre, la presentación y la imagen del carrito. */
export function lineasDelPedido(
  items: ItemCarrito[],
  resumen: ResumenPedido | null,
): LineaPedido[] {
  if (!resumen) return [];
  const porPresentacion = new Map(items.map((i) => [i.presentacionId, i]));
  return resumen.items.flatMap((linea) => {
    const item = porPresentacion.get(linea.producto_presentacion_id);
    return item
      ? [
          {
            presentacionId: item.presentacionId,
            nombre: item.nombre,
            presentacion: item.presentacion,
            imagenUrl: item.imagenUrl,
            cantidad: linea.cantidad,
            precioUnitario: linea.precio_unitario,
            precioAplicado: linea.precio_aplicado,
            esMayorista: linea.es_mayorista,
            subtotal: linea.subtotal,
          },
        ]
      : [];
  });
}

/** Prefijos de RUC vigentes en SUNAT: los mismos que acepta el backend. */
const PREFIJOS_RUC = ['10', '15', '17', '20'];
const PESOS_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
/** Razón social: mínimo del prototipo y máximo que acepta el backend. */
export const RAZON_SOCIAL_MINIMA = 3;
export const RAZON_SOCIAL_MAXIMA = 200;

/** RUC peruano: 11 dígitos, prefijo válido y dígito verificador (módulo 11), como el backend. */
export function esRucValido(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc) || !PREFIJOS_RUC.includes(ruc.slice(0, 2))) return false;
  const suma = PESOS_RUC.reduce((total, peso, i) => total + peso * Number(ruc[i]), 0);
  return (11 - (suma % 11)) % 10 === Number(ruc[10]);
}

export interface ErroresComprobante {
  ruc: string | null;
  razonSocial: string | null;
}

/** Errores de la factura (RF-B29). Con boleta no se pide nada más. */
export function erroresDeComprobante(
  tipo: TipoComprobante,
  ruc: string,
  razonSocial: string,
): ErroresComprobante {
  if (tipo === 'boleta') return { ruc: null, razonSocial: null };
  const numero = ruc.trim();
  const razon = razonSocial.trim();
  let errorRuc: string | null = null;
  if (!numero) errorRuc = 'Ingresa el RUC.';
  else if (!/^\d{11}$/.test(numero)) errorRuc = 'El RUC debe tener 11 dígitos.';
  else if (!esRucValido(numero)) errorRuc = 'El RUC no es válido. Revisa el número.';

  let errorRazon: string | null = null;
  if (razon.length < RAZON_SOCIAL_MINIMA) errorRazon = 'Ingresa la razón social.';
  else if (razon.length > RAZON_SOCIAL_MAXIMA) {
    errorRazon = `La razón social no puede pasar de ${RAZON_SOCIAL_MAXIMA} caracteres.`;
  }
  return { ruc: errorRuc, razonSocial: errorRazon };
}

/** Lo que se manda al servidor: con boleta, solo el tipo. */
export function comprobanteDelPedido(
  tipo: TipoComprobante,
  ruc: string,
  razonSocial: string,
): ComprobanteRequest {
  return tipo === 'factura'
    ? { tipo_comprobante: tipo, ruc: ruc.trim(), razon_social: razonSocial.trim() }
    : { tipo_comprobante: tipo };
}

export type ResultadoSimulado = 'aprobado' | 'rechazado';

/**
 * Token del checkout de Culqi SIMULADO (el proyecto aún no tiene llaves de
 * Culqi). El backend con `CULQI_SIMULADO=true` aprueba `tkn_sim_ok_*` y rechaza
 * `tkn_sim_ko_*`. No lleva datos de tarjeta: nunca se piden en el simulador.
 */
export function tokenSimulado(resultado: ResultadoSimulado, medio: MedioPago): string {
  const prefijo = resultado === 'aprobado' ? 'tkn_sim_ok_' : 'tkn_sim_ko_';
  return `${prefijo}${medio}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}
