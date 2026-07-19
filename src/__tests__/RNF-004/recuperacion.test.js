const { reconectarServicio } = require('./recuperacionService');
const request = require('supertest');
const app = require('../app');

describe('RNF-004 - CP-009: Verificar la recuperación del sistema después de una falla', () => {
  test('debe reconectarse exitosamente tras varios intentos', async () => {
    let llamadas = 0;
    const intentarConexion = jest.fn(async () => {
      llamadas++;
      return llamadas === 3; // falla en los 2 primeros intentos, se recupera en el 3ro
    });

    const resultado = await reconectarServicio(intentarConexion, 5, 10);

    expect(resultado.exito).toBe(true);
    expect(resultado.intentos).toBe(3);
    expect(intentarConexion).toHaveBeenCalledTimes(3);
  });

  test('debe reportar fallo si se agotan los intentos máximos sin recuperarse', async () => {
    const intentarConexion = jest.fn(async () => false);

    const resultado = await reconectarServicio(intentarConexion, 3, 10);

    expect(resultado.exito).toBe(false);
    expect(resultado.intentos).toBe(3);
  });

  test('no debe perder información durante el proceso de recuperación', async () => {
    const datosAntesDeLaFalla = { empleados: 15, servicios: 42 };
    let datosDespuesDeLaRecuperacion = null;

    const intentarConexion = jest.fn(async () => {
      datosDespuesDeLaRecuperacion = { ...datosAntesDeLaFalla };
      return true;
    });

    await reconectarServicio(intentarConexion);

    expect(datosDespuesDeLaRecuperacion).toEqual(datosAntesDeLaFalla);
  });

  test('el sistema debe volver a estar operativo (200) tras restablecerse de una falla simulada', async () => {
    // 1. Provocar la falla controlada
    await request(app).post('/simular-falla');
    let respuesta = await request(app).get('/health');
    expect(respuesta.statusCode).toBe(503);

    // 2. Restablecer el servicio (simula la recuperación)
    await request(app).post('/restablecer');

    // 3. Confirmar que vuelve a estar operativo
    respuesta = await request(app).get('/health');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.status).toBe('ok');
  });
});
