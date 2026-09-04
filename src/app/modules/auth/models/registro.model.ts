/** Tipo de cuenta que se registra. */
export type TipoRegistro = 'persona' | 'empresa';

/** Paso 1 del registro: tipo de cuenta + número de documento (DNI 8 díg. / RUC 11 díg.). */
export interface RegistroDocumento {
  tipo: TipoRegistro;
  documento: string;
}

/** Datos de una persona natural (paso 2 cuando `tipo === 'persona'`). */
export interface RegistroPersona {
  nombres: string;
  apellidos: string;
}

/** Datos de una empresa (paso 2 cuando `tipo === 'empresa'`). */
export interface RegistroEmpresa {
  razonSocial: string;
  nombreContacto: string;
}

/** Campos comunes del paso 2 (contacto + credenciales). */
export interface RegistroCredenciales {
  email: string;
  telefono: string;
  password: string;
}

/** Payload completo que se envía al backend al finalizar el registro. */
export type RegistroPayload = RegistroDocumento &
  RegistroCredenciales &
  Partial<RegistroPersona> &
  Partial<RegistroEmpresa>;
