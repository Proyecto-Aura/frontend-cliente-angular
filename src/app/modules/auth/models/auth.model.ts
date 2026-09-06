/** Contratos HTTP del módulo Auth del backend (`/api/v1/auth`). */

/** POST /auth/login — body. `identificador` acepta email o username. */
export interface LoginRequest {
  identificador: string;
  password: string;
}

/** POST /auth/login — respuesta. El refresh_token va en cookie httpOnly aparte. */
export interface LoginResponse {
  access_token: string;
  roles: string[];
  email_verificado: boolean;
  debe_cambiar_contrasena: boolean;
}

/** POST /auth/register — respuesta. */
export interface RegistroResponse {
  id: number;
  email: string;
  username: string;
  email_verificado: boolean;
  debe_cambiar_contrasena: boolean;
}
