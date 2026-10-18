/**
 * Modelos del flujo de registro. Los valores de enum coinciden con Prisma /
 * `RegisterClienteDto` del backend (`POST /api/v1/auth/register`).
 */

/** Enum `TipoDocumento` del backend. */
export type TipoDocumento = 'dni' | 'ruc' | 'ce' | 'pasaporte';

/** Enum `TipoCliente` del backend. RUC ⇒ empresa; el resto ⇒ persona_natural. */
export type TipoCliente = 'persona_natural' | 'empresa';

/** Enum `CategoriaCliente` del backend. El alta self-service se registra como minorista. */
export type CategoriaCliente = 'minorista' | 'mayorista';

/** Opción del desplegable "Tipo de documento" del paso 1. */
export interface OpcionDocumento {
  label: string;
  tipo: TipoDocumento;
  /** Regex de `numero-documento.validator.ts` del backend. */
  patron: RegExp;
  placeholder: string;
  ayuda: string;
}

export const OPCIONES_DOCUMENTO: readonly OpcionDocumento[] = [
  { label: 'DNI', tipo: 'dni', patron: /^\d{8}$/, placeholder: 'Ej: 12345678', ayuda: '8 dígitos' },
  {
    label: 'RUC',
    tipo: 'ruc',
    // RUC 10 = persona natural, RUC 20 = empresa (HU-B-002).
    patron: /^(10|20)\d{9}$/,
    placeholder: 'Ej: 10XXXXXXXXX / 20XXXXXXXXX',
    ayuda: '11 dígitos: 10 si eres persona natural, 20 si eres empresa',
  },
  {
    label: 'Carnet de Extranjería',
    tipo: 'ce',
    patron: /^[a-zA-Z0-9]{9,12}$/,
    placeholder: 'Ej: 001234567',
    ayuda: '9 a 12 caracteres alfanuméricos',
  },
  {
    label: 'Pasaporte',
    tipo: 'pasaporte',
    patron: /^[a-zA-Z0-9]{6,12}$/,
    placeholder: 'Ej: AB123456',
    ayuda: '6 a 12 caracteres alfanuméricos',
  },
] as const;

/**
 * HU-B-002: el documento decide qué datos se piden. DNI, CE, pasaporte y RUC 10
 * son personas naturales (datos personales); RUC 20, empresas (datos de empresa
 * y del contacto). El backend aplica la misma regla.
 */
export function tipoClienteDe(tipo: TipoDocumento, numero: string): TipoCliente {
  return tipo === 'ruc' && numero.startsWith('20') ? 'empresa' : 'persona_natural';
}

/** Paso 1 resuelto: lo que guarda el store tras elegir tipo + documento. */
export interface RegistroDocumento {
  tipoDocumento: TipoDocumento;
  tipoCliente: TipoCliente;
  numeroDocumento: string;
}

/**
 * Body de `POST /auth/register` (`RegisterClienteDto`). El `ValidationPipe` del
 * backend usa `forbidNonWhitelisted`, así que el payload debe tener SOLO estas
 * claves — nada de `confirmar`, `terminos`, `username` repetido, etc.
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
  fecha_nacimiento?: string; // ISO (yyyy-MM-dd)
  direccion?: string;
  razon_social?: string;
}
