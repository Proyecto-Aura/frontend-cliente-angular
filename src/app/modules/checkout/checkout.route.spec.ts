import { sesionGuard } from '../../shared/auth/sesion.guard';
import { CHECKOUT_ROUTES } from './checkout.route';
import { Checkout } from './pages/checkout/checkout';

describe('CHECKOUT_ROUTES (HU-B-007)', () => {
  it('protects the checkout with the session guard', () => {
    expect(CHECKOUT_ROUTES).toHaveLength(1);
    expect(CHECKOUT_ROUTES[0].path).toBe('');
    expect(CHECKOUT_ROUTES[0].canActivate).toEqual([sesionGuard]);
  });

  it('lazy-loads the checkout page', async () => {
    const cargar = CHECKOUT_ROUTES[0].loadComponent as () => Promise<unknown>;

    expect(await cargar()).toBe(Checkout);
  });
});
