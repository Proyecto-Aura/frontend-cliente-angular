import { NOTIFICACION_APROBADA } from '../testing/notificaciones-data';
import { reembolsoDeNotificacion } from './notificacion-portal.model';

describe('reembolsoDeNotificacion', () => {
  it('accepts only a positive safe integer reference for a refund', () => {
    expect(reembolsoDeNotificacion(NOTIFICACION_APROBADA)).toBe(31);
    expect(
      reembolsoDeNotificacion({ ...NOTIFICACION_APROBADA, referencia_tipo: 'pedido' }),
    ).toBeNull();
  });
  it.each([null, '', '0', '-1', '1.5', '31/otro', 'https://example.test', '9007199254740992'])(
    'does not turn an untrusted reference %s into navigation',
    (referencia_id) => {
      expect(reembolsoDeNotificacion({ ...NOTIFICACION_APROBADA, referencia_id })).toBeNull();
    },
  );
});
