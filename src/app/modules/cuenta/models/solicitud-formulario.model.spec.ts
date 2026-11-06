import { EstadoPedido } from './pedido-portal.model';
import {
  PEDIDO_DETALLE_PRUEBA as detalle,
  PEDIDO_RESUMEN_PRUEBA as resumen,
} from '../testing/pedidos-data';
import { esPedidoElegible, pedidoParaReembolso } from './solicitud-formulario.model';

describe('Adaptación de pedidos para RF-B38, RF-B39 y RF-B40', () => {
  it.each<EstadoPedido>(['confirmado', 'entregado', 'cancelado'])(
    'offers a paid %s order without a previous refund',
    (estado) => {
      const opcion = pedidoParaReembolso({
        resumen,
        detalle: { ...detalle, estado },
        errorDetalle: null,
      })!;
      expect(esPedidoElegible(opcion)).toBe(true);
    },
  );
  it.each<EstadoPedido>([
    'en_camino',
    'en_preparacion',
    'pendiente_entrega',
    'en_espera_inventario',
  ])('does not offer %s even if paid', (estado) => {
    const opcion = pedidoParaReembolso({
      resumen,
      detalle: { ...detalle, estado },
      errorDetalle: null,
    })!;
    expect(esPedidoElegible(opcion)).toBe(false);
  });
  it.each(['pendiente', 'aprobado', 'rechazado', 'reembolsado'] as const)(
    'does not allow a second request when the first is %s',
    (estado) => {
      const opcion = pedidoParaReembolso({
        resumen: { ...resumen, reembolso: { id: 3, estado } },
        detalle,
        errorDetalle: null,
      })!;
      expect(esPedidoElegible(opcion)).toBe(false);
    },
  );
  it('rejects missing or mismatched details and an unpaid order', () => {
    expect(pedidoParaReembolso({ resumen, detalle: null, errorDetalle: 'error' })).toBeNull();
    expect(
      pedidoParaReembolso({ resumen, detalle: { ...detalle, id: 99 }, errorDetalle: null }),
    ).toBeNull();
    expect(
      esPedidoElegible(
        pedidoParaReembolso({ resumen, detalle: { ...detalle, pago: null }, errorDetalle: null })!,
      ),
    ).toBe(false);
  });
});
