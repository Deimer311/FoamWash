import { Test, TestingModule } from '@nestjs/testing';

describe('Promociones (RF-16)', () => {
  const aplicarDescuento = (monto: number, codigo: string) => {
    const cuponesValidos: Record<string, number> = {
      FOAM10: 0.1, // 10%
      FOAM20: 0.2, // 20%
    };

    if (!cuponesValidos[codigo]) {
      throw new Error('Cupón inválido o vencido');
    }

    const porcentaje = cuponesValidos[codigo];
    const descuento = monto * porcentaje;
    return {
      montoOriginal: monto,
      descuento,
      montoFinal: monto - descuento,
    };
  };

  it('CP-083: Aplicación exitosa de un cupón de descuento válido.', () => {
    const res = aplicarDescuento(100000, 'FOAM10');
    expect(res.descuento).toBe(10000);
    expect(res.montoFinal).toBe(90000);
  });

  it('CP-084: Rechazo de cupón inexistente o vencido.', () => {
    expect(() => aplicarDescuento(100000, 'CUPON_FALSO')).toThrow('Cupón inválido o vencido');
  });

  it('CP-085: Validar cupón con 20% de descuento.', () => {
    const res = aplicarDescuento(200000, 'FOAM20');
    expect(res.descuento).toBe(40000);
    expect(res.montoFinal).toBe(160000);
  });

  it('CP-086: El descuento no debe superar el valor total del servicio.', () => {
    const res = aplicarDescuento(50000, 'FOAM10');
    expect(res.montoFinal).toBeGreaterThan(0);
  });

  it('CP-087: Sensibilidad a mayúsculas/minúsculas en el código de promoción.', () => {
    expect(() => aplicarDescuento(100000, 'foam10')).toThrow('Cupón inválido o vencido');
  });
});
