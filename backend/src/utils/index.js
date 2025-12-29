/**
 * =============================================================================
 * 📦 EXPORTACIÓN CENTRALIZADA DE UTILIDADES
 * -----------------------------------------------------------------------------
 * Permite importar todas las utils desde un solo lugar.
 * -----------------------------------------------------------------------------
 * @example
 * // En lugar de:
 * const { hashPassword } = require('./utils/password.util');
 * const { generateAccessToken } = require('./utils/jwt.util');
 * -----------------------------------------------------------------------------
 * // Puedes hacer:
 * const { hashPassword, generateAccessToken } = require('./utils');
 * -----------------------------------------------------------------------------
 * archivo: src/utils/index.js
 * creado el dia: 6-12-2025
 * =============================================================================
 */

const passwordUtil = require('./password.util');
const jwtUtil = require('./jwt.util');
const responseUtil = require('./response.util');

module.exports = {
  // Password utilities
    ...passwordUtil,
    
  // JWT utilities
    ...jwtUtil,
    
  // Response utilities
    ...responseUtil
};