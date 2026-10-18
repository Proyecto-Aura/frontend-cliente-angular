/** Contratos HTTP del módulo Auth del backend (`/api/v1/auth`). */

/** POST /auth/login — body. `identificador` acepta email o username. */
export interface LoginRequest {
  identificador: string;
  password: string;
  /** "Recordar sesión por 30 días": el refresh token dura 30 días. */
  recordar: boolean;
}

/** POST /auth/login — respuesta. El refresh_token va en cookie httpOnly aparte. */
export interface LoginResponse {
  access_token: string;
  roles: string[];
  email_verificado: boolean;
  debe_cambiar_contrasena: boolean;
}

/** POST /auth/register — respuesta. La cuenta nace con el correo sin verificar. */
export interface RegistroResponse {
  id: string;
  email: string;
  username: string;
  email_verificado: boolean;
  debe_cambiar_contrasena: boolean;
}

/** Rol que da acceso a este portal; los roles de la empresa entran al otro. */
export const ROL_CLIENTE = 'cliente';

/** El usuario existe pero no es cliente: para el portal es como si no existiera. */
export class SinAccesoAlPortalError extends Error {
  constructor() {
    super('Credenciales inválidas');
    this.name = 'SinAccesoAlPortalError';
  }
}
