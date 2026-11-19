/** Perfil del cliente que inició sesión (`GET /api/v1/perfil`, HU-B-015). */
export interface PerfilCliente {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string | null;
  /** HU-B-018: dirección de entrega predeterminada y su ubicación (null si aún no la registra). */
  direccion?: string | null;
  ubicacion?: UbicacionPerfil | null;
  tipo_documento: string;
  numero_documento: string;
  tipo_cliente: 'persona_natural' | 'empresa' | null;
  razon_social: string | null;
}

/** Ítem del catálogo de ubicación (departamento, provincia o distrito). */
export interface UbigeoItem {
  id: string;
  nombre: string;
}

export interface UbicacionPerfil {
  departamento: UbigeoItem;
  provincia: UbigeoItem;
  distrito: UbigeoItem;
}

/**
 * Respuesta del `PATCH /perfil`. HU-B-016: si el email cambió, no se aplica
 * todavía; el backend envía un enlace al correo nuevo y lo indica aquí.
 */
export interface PerfilActualizado extends PerfilCliente {
  cambio_email_pendiente?: boolean;
}

/** Lo que el cliente puede editar (RF-B43, RF-B46); solo se envía lo que cambió. */
export interface ActualizarPerfil {
  nombres?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  distrito_id?: string;
}
