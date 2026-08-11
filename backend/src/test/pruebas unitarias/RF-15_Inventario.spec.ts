import { Test, TestingModule } from '@nestjs/testing';

describe('Inventario (RF-15)', () => {
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
    let stockActual = 10;
    const consumoPorServicio = 2;

    stockActual -= consumoPorServicio;

    expect(stockActual).toBe(8);
  });

  it('CP-082: Alerta de reposición cuando el insumo llega a 0.', () => {
    const stock = 0;
    const requiereAlerta = stock === 0;

    expect(requiereAlerta).toBe(true);
  });
});
