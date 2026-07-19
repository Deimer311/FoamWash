/**
 * RNF-008: Facilitar actualización sin afectar el servicio
 * Simula el proceso de aplicar una actualización (ej. una migración de datos)
 * midiendo cuánto tiempo el sistema queda indisponible.
 */

/**
 * Aplica una actualización sobre los datos actuales del sistema.
 * @param {object} datosActuales - estado actual (ej. clientes, empleados, servicios)
 * @param {object} cambios - los cambios que introduce la actualización
 * @param {number} tiempoInactividadMs - cuánto dura la ventana de mantenimiento
 * @returns {Promise<{datosActualizados: object, duracionMs: number}>}
 */
async function ejecutarActualizacion(datosActuales, cambios, tiempoInactividadMs = 0) {
  const inicio = Date.now();

  // Mientras dura esto, el sistema se considera "en mantenimiento"
  await new Promise((resolve) => setTimeout(resolve, tiempoInactividadMs));

  // La actualización se aplica SOBRE los datos existentes, nunca los reemplaza
  const datosActualizados = { ...datosActuales, ...cambios };

  const duracionMs = Date.now() - inicio;
  return { datosActualizados, duracionMs };
}

module.exports = { ejecutarActualizacion, LIMITE_INDISPONIBILIDAD_MS: 15 * 60 * 1000 };
