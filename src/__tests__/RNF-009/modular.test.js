const { generarReporteEmpleados } = require('./reportesModule');
const request = require('supertest');
const app = require('../app');

describe('RNF-009 - CP-018: Verificar la integración de un nuevo módulo', () => {
  test('la función del nuevo módulo debe generar el reporte correctamente', () => {
    const empleados = [
      { id: 1, nombre: 'Ana' },
      { id: 2, nombre: 'Luis' },
      { id: 3, nombre: 'Marta' },
    ];

    const reporte = generarReporteEmpleados(empleados);

    expect(reporte.totalEmpleados).toBe(3);
    expect(reporte.nombres).toEqual(['Ana', 'Luis', 'Marta']);
  });

  test('el endpoint del nuevo módulo debe responder correctamente', async () => {
    const respuesta = await request(app).get('/reportes/empleados');

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.totalEmpleados).toBe(2);
  });
});

describe('RNF-009 - CP-019: Verificar el funcionamiento de los módulos existentes después de la integración', () => {
  // Esto es una prueba de regresión: los mismos endpoints que ya existían
  // antes de agregar /reportes/empleados deben seguir funcionando igual.
  test('/health sigue respondiendo con normalidad', async () => {
    const respuesta = await request(app).get('/health');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.status).toBe('ok');
  });

  test('/empleados sigue respondiendo con normalidad', async () => {
    const respuesta = await request(app).get('/empleados');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.empleados).toBeInstanceOf(Array);
  });

  test('el flujo de falla/restablecimiento (RNF-004) no se vio afectado por el módulo nuevo', async () => {
    await request(app).post('/simular-falla');
    let respuesta = await request(app).get('/health');
    expect(respuesta.statusCode).toBe(503);

    await request(app).post('/restablecer');
    respuesta = await request(app).get('/health');
    expect(respuesta.statusCode).toBe(200);
  });
});
