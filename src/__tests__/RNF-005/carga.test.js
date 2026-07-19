const request = require('supertest');
const app = require('../app');

describe('RNF-005 - CP-010: Simular múltiples usuarios concurrentes', () => {
  test('debe procesar 100 solicitudes concurrentes sin errores', async () => {
    const NUM_USUARIOS = 100;

    // Dispara las 100 solicitudes "al mismo tiempo" (no una tras otra)
    const peticiones = Array.from({ length: NUM_USUARIOS }, () =>
      request(app).get('/empleados')
    );

    const respuestas = await Promise.all(peticiones);

    // Ninguna debe fallar
    respuestas.forEach((respuesta) => {
      expect(respuesta.statusCode).toBe(200);
    });

    expect(respuestas).toHaveLength(NUM_USUARIOS);
  }, 15000); // se sube el timeout porque son muchas peticiones a la vez
});

describe('RNF-005 - CP-011: Verificar el tiempo de respuesta bajo carga', () => {
  test('el tiempo promedio de respuesta debe ser inferior a 3 segundos', async () => {
    const NUM_USUARIOS = 100;
    const LIMITE_MS = 3000;

    const inicio = Date.now();

    const peticiones = Array.from({ length: NUM_USUARIOS }, () =>
      request(app).get('/empleados')
    );
    const respuestas = await Promise.all(peticiones);

    const tiempoTotalMs = Date.now() - inicio;
    const tiempoPromedioMs = tiempoTotalMs / NUM_USUARIOS;

    respuestas.forEach((respuesta) => {
      expect(respuesta.statusCode).toBe(200);
    });
    expect(tiempoPromedioMs).toBeLessThan(LIMITE_MS);
  }, 15000);
});
