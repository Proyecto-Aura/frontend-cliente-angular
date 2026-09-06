import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae un mensaje legible de una respuesta de error del backend.
 * El backend responde `{ message: string }` (errores de dominio) o
 * `{ message: string[] }` (errores de validación del ValidationPipe).
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
    }
    const msg = (err.error as { message?: string | string[] } | null)?.message;
    if (Array.isArray(msg) && msg.length) return msg[0];
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}
