/**
 * =============================================================================
 * EXPORTACION CENTRALIZADDA DE CONSTANTES
 * Descripcion: Este archivo centraliza la exportacion de todas las constantes
 * utilizadas en la aplicacion, facilitando su importacion en otros modulos.
 * Cada conjunto de constantes se encuentra en su propio archivo dentro del
 * directorio 'constants'.
 * este archivo esta ubicado en: src/constants/index.js
 * archivo editado el 4 de diciembre de 2025
 * =============================================================================
 */
      const roles = require('./roles');
      const errors = require('./errors');
      const estados = require('./estados');

      module.exports = {
      // Roles
      ROLES: roles.ROLES,
      ROLE_HIERARCHY: roles.ROLE_HIERARCHY,
      isValidRole: roles.isValidRole,
      hasHigherOrEqualRole: roles.hasHigherOrEqualRole,
      getAllRoles: roles.getAllRoles,
      
      // Errores
      ERROR_CODES: errors.ERROR_CODES,
      getErrorByCode: errors.getErrorByCode,
      createErrorResponse: errors.createErrorResponse,
      
      // Estados
      ESTADOS_RESERVA: estados.ESTADOS_RESERVA,
      ESTADOS_COTIZACION: estados.ESTADOS_COTIZACION,
      ESTADOS_USUARIO: estados.ESTADOS_USUARIO,
      isValidEstadoReserva: estados.isValidEstadoReserva
      };