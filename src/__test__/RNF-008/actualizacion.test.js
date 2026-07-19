const {
  ejecutarActualizacion,
  LIMITE_INDISPONIBILIDAD_MS,
} = require('./actualizacionService');
const request = require('supertest');
const app = require('./app');

describe('RNF-008 - CP-016: Verificar actualización sin pérdida de información', () => {
  test('los datos existentes deben permanecer intactos después de actualizar', async () => {
    const datosAntes = {
      clientes: ['Cliente A', 'Cliente B'],
      servicios: ['Lavado de sofás', 'Lavado de alfombras'],
    };
    const cambios = { version: '1.1.0' }; // la actualización solo agrega, no borra

    const { datosActualizados } = await ejecutarActualizacion(datosAntes, cambios, 10);

    // La información previa sigue ahí...
    expect(datosActualizados.clientes).toEqual(datosAntes.clientes);
    expect(datosActualizados.servicios).toEqual(datosAntes.servicios);
    // ...y además se aplicó el cambio nuevo
    expect(datosActualizados.version).toBe('1.1.0');
  });
});

describe('RNF-008 - CP-017: Verificar continuidad del servicio durante la actualización', () => {
  test('la indisponibilidad de la actualización debe ser menor a 15 minutos', async () => {
    // Se simula una ventana de mantenimiento corta (en un caso real sería el tiempo real del despliegue)
    const tiempoInactividadSimuladoMs = 50;

    const { duracionMs } = await ejecutarActualizacion(
      { clientes: [] },
      { version: '1.1.0' },
      tiempoInactividadSimuladoMs
    );

    expect(duracionMs).toBeLessThan(LIMITE_INDISPONIBILIDAD_MS);
  });

  test('el sistema debe volver a responder normalmente una vez terminada la actualización', async () => {
    // 1. Se simula la caída momentánea propia de la actualización
    await request(app).post('/simular-falla');

    // 2. Se simula que la actualización terminó y el servicio se restablece
    await request(app).post('/restablecer');

    // 3. Confirmar que los usuarios pueden seguir utilizando el sistema
    const respuesta = await request(app).get('/health');
    expect(respuesta.statusCode).toBe(200);
  });
});
