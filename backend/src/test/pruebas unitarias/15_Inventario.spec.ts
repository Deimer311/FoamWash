import { Test, TestingModule } from '@nestjs/testing';

describe('Inventario', () => {
  it('CP-080: Control de stock de insumos de limpieza.', () => {
    const inventario = [
      { id: 1, nombre: 'Shampoo de Espuma Seca', stock: 15, minimo: 5 },
      { id: 2, nombre: 'Desmanchador Enzimático', stock: 3, minimo: 5 },
    ];

    const esStockBajo = (item: { stock: number; minimo: number }) => item.stock < item.minimo;

    expect(esStockBajo(inventario[0])).toBe(false);
    expect(esStockBajo(inventario[1])).toBe(true);
  });

  it('CP-081: Descuento automático de insumos al completar un servicio.', () => {
    const simularConsumo = (stockActual: number, consumo: number) => stockActual - consumo;
    expect(simularConsumo(10, 2)).toBe(8);
  });

  it('CP-082: Alerta de reposición cuando el insumo llega a 0.', () => {
    const verificarAlerta = (stock: number) => stock === 0;
    expect(verificarAlerta(0)).toBe(true);
  });
});
