/**
 * RNF-004: Estar disponible el 99 % del tiempo
 * Lógica de soporte para CP-009 (verificar la recuperación del sistema después de una falla)
 */

/**
 * Intenta reconectar un servicio (BD, API externa, etc.) hasta un número máximo de intentos.
 * @param {Function} intentarConexion - función async que retorna true/false según el resultado del intento
 * @param {number} maxIntentos
 * @param {number} esperaMs - espera entre reintentos
 * @returns {Promise<{exito: boolean, intentos: number}>}
 */
async function reconectarServicio(intentarConexion, maxIntentos = 3, esperaMs = 100) {
  let intentos = 0;
  while (intentos < maxIntentos) {
    intentos++;
    const conectado = await intentarConexion();
    if (conectado) {
      return { exito: true, intentos };
    }
    await new Promise((resolve) => setTimeout(resolve, esperaMs));
  }
  return { exito: false, intentos };
}

module.exports = { reconectarServicio };
