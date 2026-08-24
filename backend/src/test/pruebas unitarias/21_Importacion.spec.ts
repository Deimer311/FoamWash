import { Test, TestingModule } from '@nestjs/testing';

describe('Importación de Datos', () => {
  const importarClientesJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) throw new Error('El formato debe ser un array');
      const validos = data.filter((item) => item.nombre && item.correo);
      return { total: data.length, procesados: validos.length, validos };
    } catch (e: any) {
      throw new Error(`Error de importación: ${e.message}`);
    }
  };

  it('CP-105: Importar lista de clientes en formato JSON correctamente.', () => {
    const jsonInput = JSON.stringify([
      { nombre: 'Cliente 1', correo: 'c1@test.com' },
      { nombre: 'Cliente 2', correo: 'c2@test.com' },
    ]);

    const res = importarClientesJSON(jsonInput);
    expect(res.total).toBe(2);
    expect(res.procesados).toBe(2);
  });

  it('CP-106: Descartar filas con datos requeridos faltantes durante la importación.', () => {
    const jsonInput = JSON.stringify([
      { nombre: 'Cliente Valido', correo: 'valido@test.com' },
      { nombre: '', correo: 'invalido@test.com' },
      { nombre: 'Sin Correo', correo: '' },
    ]);

    const res = importarClientesJSON(jsonInput);
    expect(res.total).toBe(3);
    expect(res.procesados).toBe(1);
  });

  it('CP-107: Manejo de error cuando el JSON es sintácticamente inválido.', () => {
    expect(() => importarClientesJSON('{ json_malo }')).toThrow('Error de importación');
  });
});
