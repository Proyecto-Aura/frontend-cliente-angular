/** Perfil del cliente que inició sesión (`GET /api/v1/perfil`, HU-B-015). */
export interface PerfilCliente {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string | null;
  tipo_documento: string;
  numero_documento: string;
  tipo_cliente: 'persona_natural' | 'empresa' | null;
  razon_social: string | null;
}

/**
 * Respuesta del `PATCH /perfil`. HU-B-016: si el email cambió, no se aplica
 * todavía; el backend envía un enlace al correo nuevo y lo indica aquí.
 */
export interface PerfilActualizado extends PerfilCliente {
  cambio_email_pendiente?: boolean;
}

/** Lo que el cliente puede editar (RF-B43); solo se envía lo que cambió. */
export interface ActualizarPerfil {
  nombres?: string;
  email?: string;
  telefono?: string;
}
