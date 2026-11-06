import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from '../../../shared/utils/api-error';

export interface ErrorEnvioReembolso {
  mensaje: string;
  requiereRevision: boolean;
}

/** Un error de transporte o servidor no demuestra que el POST no se guardó. */
export function errorEnvioReembolso(error: unknown): ErrorEnvioReembolso {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 400 || error.status === 422) {
      const respaldo = 'Revisa el motivo, la descripción y la evidencia adjunta.';
      const mensaje = apiErrorMessage(error, respaldo);
      // class-validator y ParseFilePipe pueden devolver sus mensajes técnicos en inglés.
      const tecnico =
        /^(?:Validation failed\b|File is required\b|(?:pedido_id|motivo|descripcion) (?:must|should)\b|property \S+ should not exist)/i.test(
          mensaje,
        );
      return {
        mensaje: tecnico ? respaldo : mensaje,
        requiereRevision: false,
      };
    }
    if (error.status === 413) {
      return {
        mensaje: 'La evidencia debe pesar menos de 5 MiB. Selecciona un archivo más pequeño.',
        requiereRevision: false,
      };
    }
    if (error.status === 401) {
      return {
        mensaje: 'Tu sesión ha vencido. Cierra el formulario e inicia sesión de nuevo.',
        requiereRevision: true,
      };
    }
    if (error.status === 403) {
      return {
        mensaje:
          'No tienes permiso para solicitar este reembolso. Cierra el formulario y verifica tu sesión de cliente.',
        requiereRevision: true,
      };
    }
    if (error.status === 404) {
      return {
        mensaje:
          'El pedido ya no está disponible para tu cuenta. Cierra el formulario y revisa tus pedidos.',
        requiereRevision: true,
      };
    }
    if (error.status === 409) {
      return {
        mensaje: `${apiErrorMessage(error, 'El pedido ya no admite esta solicitud.')} Cierra el formulario y revisa tus pedidos.`,
        requiereRevision: true,
      };
    }
  }
  return {
    mensaje:
      'No pudimos confirmar si se registró la solicitud. Cierra el formulario y revisa tus pedidos antes de volver a intentarlo.',
    requiereRevision: true,
  };
}
