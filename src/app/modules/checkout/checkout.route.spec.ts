import { sesionGuard } from '../../shared/auth/sesion.guard';
import { CHECKOUT_ROUTES } from './checkout.route';
import { Checkout } from './pages/checkout/checkout';
import { CheckoutExito } from './pages/checkout-exito/checkout-exito';

describe('CHECKOUT_ROUTES (HU-B-007, HU-B-008)', () => {
  it('protects the checkout with the session guard', () => {
    expect(CHECKOUT_ROUTES).toHaveLength(2);
    expect(CHECKOUT_ROUTES[0].path).toBe('');
    expect(CHECKOUT_ROUTES[0].canActivate).toEqual([sesionGuard]);
  });

  it('lazy-loads the checkout page', async () => {
    const cargar = CHECKOUT_ROUTES[0].loadComponent as () => Promise<unknown>;

    expect(await cargar()).toBe(Checkout);
  });

  it('protects and lazy-loads the paid order page', async () => {
    const exito = CHECKOUT_ROUTES.find((r) => r.path === 'exito/:id')!;
    const cargar = exito.loadComponent as () => Promise<unknown>;

    expect(exito.canActivate).toEqual([sesionGuard]);
    expect(await cargar()).toBe(CheckoutExito);
  });
});
