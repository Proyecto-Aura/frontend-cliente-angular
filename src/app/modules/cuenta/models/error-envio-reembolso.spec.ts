import { HttpErrorResponse } from '@angular/common/http';
import { errorEnvioReembolso } from './error-envio-reembolso';

describe('Errores al enviar un reembolso', () => {
  it('allows correcting invalid data or an oversized file without losing the draft', () => {
    const validacion = errorEnvioReembolso(
      new HttpErrorResponse({
        status: 400,
        error: { message: ['Revisa la evidencia.', 'Otra validación.'] },
      }),
    );
    expect(validacion).toEqual({ mensaje: 'Revisa la evidencia.', requiereRevision: false });
    const archivo = errorEnvioReembolso(new HttpErrorResponse({ status: 413 }));
    expect(archivo.mensaje).toContain('5 MiB');
    expect(archivo.requiereRevision).toBe(false);
  });
  it.each([0, 408, 500, 503])(
    'does not assume an unsuccessful save on status %s and hides internal details',
    (status) => {
      const error = errorEnvioReembolso(
        new HttpErrorResponse({ status, error: { message: 'Internal storage credentials' } }),
      );
      expect(error.requiereRevision).toBe(true);
      expect(error.mensaje).toContain('No pudimos confirmar');
      expect(error.mensaje).not.toContain('credentials');
    },
  );
  it.each([401, 403, 404, 409])(
    'requires reviewing the session or order before resubmitting on %s',
    (status) => {
      expect(errorEnvioReembolso(new HttpErrorResponse({ status })).requiereRevision).toBe(true);
    },
  );
});
