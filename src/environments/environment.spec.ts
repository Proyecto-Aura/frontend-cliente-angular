import { environment } from './environment';
import { environment as environmentProd } from './environment.prod';

// El backend monta todo bajo el prefijo global `api/v1`: sin él, cada llamada
// responde 404 ("Cannot POST /api/auth/...").
describe('environment', () => {
  it.each([
    ['development', environment.apiUrl],
    ['production', environmentProd.apiUrl],
  ])('%s points to the /api/v1 prefix of the backend', (_, apiUrl) => {
    expect(apiUrl.endsWith('/api/v1')).toBe(true);
  });
});
