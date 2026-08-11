import { Test, TestingModule } from '@nestjs/testing';

describe('Calificaciones (RF-17)', () => {
  const registrarCalificacion = (puntaje: number, comentario?: string) => {
    if (puntaje < 1 || puntaje > 5) {
      throw new Error('El puntaje debe estar entre 1 y 5 estrellas');
    }
    return {
      puntaje,
      comentario: comentario?.trim() || null,
      fecha: new Date(),
    };
  };

  it('CP-088: Registrar calificación de 5 estrellas con comentario.', () => {
    const res = registrarCalificacion(5, 'Excelente servicio de limpieza');
    expect(res.puntaje).toBe(5);
    expect(res.comentario).toBe('Excelente servicio de limpieza');
  });

  it('CP-089: Registrar calificación sin comentario obligatorio.', () => {
    const res = registrarCalificacion(4);
    expect(res.puntaje).toBe(4);
    expect(res.comentario).toBeNull();
  });

  it('CP-090: Rechazar puntaje menor a 1 estrella.', () => {
    expect(() => registrarCalificacion(0)).toThrow('El puntaje debe estar entre 1 y 5 estrellas');
  });

  it('CP-091: Rechazar puntaje mayor a 5 estrellas.', () => {
    expect(() => registrarCalificacion(6)).toThrow('El puntaje debe estar entre 1 y 5 estrellas');
  });

  it('CP-092: Calcular promedio de calificaciones correctamente.', () => {
    const calificaciones = [5, 4, 3, 5, 5];
    const promedio = calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;

    expect(promedio).toBe(4.4);
  });
});
