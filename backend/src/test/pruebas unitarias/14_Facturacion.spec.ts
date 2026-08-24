import { Test, TestingModule } from '@nestjs/testing';

describe('Facturación', () => {
  it('CP-077: Generar estructura de comprobante de servicio con consecutivo.', () => {
    const generarFactura = (reservaId: number, clienteNombre: string, total: number) => ({
      numeroFactura: `FAC-${reservaId.toString().padStart(5, '0')}`,
      cliente: clienteNombre,
      subtotal: total,
      iva: total * 0.19,
      totalPagar: total * 1.19,
      fechaEmision: new Date().toISOString(),
    });

    const factura = generarFactura(45, 'Ana Martinez', 200000);

    expect(factura.numeroFactura).toBe('FAC-00045');
    expect(factura.cliente).toBe('Ana Martinez');
    expect(factura.subtotal).toBe(200000);
    expect(factura.totalPagar).toBe(238000);
  });

  it('CP-078: Validar formateo de moneda en la orden/factura.', () => {
    const formatCOP = (valor: number) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

    const formatted = formatCOP(150000);
    expect(formatted).toContain('150');
  });

  it('CP-079: Desglose correcto de items facturados.', () => {
    const items = [
      { servicio: 'Sofá 3 Puestos', cantidad: 1, precioUnitario: 120000 },
      { servicio: 'Protector Impermeable', cantidad: 2, precioUnitario: 30000 },
    ];

    const total = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
    expect(total).toBe(180000);
  });
});
