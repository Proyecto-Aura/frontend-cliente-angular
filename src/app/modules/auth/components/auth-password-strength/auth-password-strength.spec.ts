import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPasswordStrength } from './auth-password-strength';

describe('AuthPasswordStrength (RF-B08)', () => {
  let fixture: ComponentFixture<AuthPasswordStrength>;

  const nivel = (password: string) => {
    fixture.componentRef.setInput('password', password);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('p')?.textContent?.trim();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPasswordStrength);
  });

  it('shows no level while the password is empty', () => {
    expect(nivel('')).toBeUndefined();
  });

  it.each([
    ['abcdefgh', 'Muy débil'],
    ['abcdefgh1', 'Débil'],
    ['Abcdefgh1', 'Aceptable'],
    ['Abcdefgh1!', 'Segura'],
    ['Abcdefghij1!', 'Muy segura'],
  ])('rates "%s" as %s in real time', (password, esperado) => {
    expect(nivel(password)).toBe(esperado);
  });
});
