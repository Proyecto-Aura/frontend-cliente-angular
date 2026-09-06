/** Reglas de contraseña del prototipo del portal cliente. */
export interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { label: 'Más de 10 caracteres', test: (p) => p.length > 10 },
  { label: 'Incluye números', test: (p) => /[0-9]/.test(p) },
  { label: 'Incluye letras mayúsculas', test: (p) => /[A-Z]/.test(p) },
  { label: 'Incluye letras minúsculas', test: (p) => /[a-z]/.test(p) },
  { label: 'Al menos un carácter especial', test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

/** Nº de reglas cumplidas (0–5). El registro exige al menos 3. */
export function passwordScore(p: string): number {
  return PASSWORD_RULES.filter((r) => r.test(p)).length;
}

export const PASSWORD_MIN_SCORE = 3;

export const STRENGTH_LEVELS = [
  { label: '', color: '#e0e0e0' },
  { label: 'Muy débil', color: '#ef4444' },
  { label: 'Débil', color: '#f97316' },
  { label: 'Aceptable', color: '#eab308' },
  { label: 'Segura', color: '#4ade80' },
  { label: 'Muy segura', color: '#15803d' },
] as const;
