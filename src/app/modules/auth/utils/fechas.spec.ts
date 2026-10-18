import { FormControl } from '@angular/forms';

import { fechaNoFutura, hoyISO } from './fechas';

describe('fechas', () => {
  it('formats today as YYYY-MM-DD in the browser time zone', () => {
    expect(hoyISO(new Date(2026, 9, 18, 23, 30))).toBe('2026-10-18');
    expect(hoyISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  describe('fechaNoFutura', () => {
    const validar = (valor: string) =>
      new FormControl(valor, { validators: fechaNoFutura(() => '2026-10-18') }).errors;

    it('accepts today and past dates', () => {
      expect(validar('2026-10-18')).toBeNull();
      expect(validar('1998-05-12')).toBeNull();
    });

    it('rejects a date after today', () => {
      expect(validar('2026-10-19')).toEqual({ fechaFutura: true });
    });

    it('leaves the empty case to Validators.required', () => {
      expect(validar('')).toBeNull();
    });
  });
});
