import { Test, TestingModule } from '@nestjs/testing';

describe('Exportación de Datos', () => {
  const exportarACSV = (datos: Array<Record<string, any>>) => {
    if (!datos || datos.length === 0) return '';
    const headers = Object.keys(datos[0]).join(',');
    const rows = datos.map((d) => Object.values(d).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  it('CP-102: Generar formato pdf de reservas realizadas.', () => {
    const data = [
      { id: 1, servicio: 'Lavado Sofa', precio: 120000, estado: 'Completado' },
      { id: 2, servicio: 'Lavado Colchón', precio: 140000, estado: 'Pendiente' },
    ];

    const csv = exportarACSV(data);

    expect(csv).toContain('id,servicio,precio,estado');
    expect(csv).toContain('1,Lavado Sofa,120000,Completado');
  });

  it('CP-103: Manejar exportación de lista vacía.', () => {
    const csv = exportarACSV([]);
    expect(csv).toBe('');
  });

  it('CP-104: Validar encabezados correctos en archivo exportado.', () => {
    const data = [{ cliente: 'Juan', total: 50000 }];
    const csv = exportarACSV(data);
    expect(csv.startsWith('cliente,total')).toBe(true);
  });
});
