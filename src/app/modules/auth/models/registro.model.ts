/**
 * Modelos del flujo de registro. Los valores de enum coinciden con Prisma /
 * `RegisterClienteDto` del backend (`POST /api/v1/auth/register`).
 */

/** Enum `TipoDocumento` del backend. En este front solo se exponen dni y ruc. */
export type TipoDocumento = 'dni' | 'ruc' | 'ce' | 'pasaporte';

/** Enum `TipoCliente` del backend. */
export type TipoCliente = 'persona_natural' | 'empresa';

/** Enum `CategoriaCliente` del backend. Self-service se registra como minorista. */
export type CategoriaCliente = 'minorista' | 'mayorista';

/** Elección de la UI en el paso 1 (se traduce a tipo_documento + tipo_cliente). */
export type TipoRegistro = 'persona' | 'empresa';

/** Paso 1 resuelto: lo que guarda el store tras elegir tipo + documento. */
export interface RegistroDocumento {
  tipo: TipoRegistro;
  tipoDocumento: TipoDocumento;
  tipoCliente: TipoCliente;
  numeroDocumento: string;
}

/**
 * Body de `POST /auth/register` (`RegisterClienteDto`). El `ValidationPipe` del
 * backend usa `forbidNonWhitelisted`, así que el payload debe tener SOLO estas
 * claves — nada de `confirmar`, `terminos`, etc.
 */
export interface RegisterClientePayload {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  tipo_cliente: TipoCliente;
  categoria_cliente: CategoriaCliente;
  email: string;
  username: string;
  password: string;
  telefono?: string;
  razon_social?: string;
}
