/**=============================================================================
 * 📤 UTILIDADES DE RESPUESTAS HTTP ESTANDARIZADAS
 * -----------------------------------------------------------------------------
 * Este módulo proporciona funciones helper para crear respuestas HTTP consistentes
 * en toda la aplicación. Todas las respuestas siguen el mismo formato.
 * -----------------------------------------------------------------------------
 * ¿Por qué estandarizar respuestas?
 * - El frontend sabe exactamente qué esperar
 * - Más fácil de documentar en Swagger
 * - Mejor experiencia de desarrollo
 * - Consistencia en toda la API
 * -----------------------------------------------------------------------------
 * Cada función retorna una respuesta JSON con la estructura:
 * {
 *  success: boolean,
 * message: string,
 * data: any,
 * error: { message: string, details?: any },
 *  pagination?: { page, limit, total, totalPages, hasNext, hasPrev }
 * }
 * -----------------------------------------------------------------------------
 * el archivo esta organizado en secciones:
 * 1. Respuestas básicas (success, error)
 * 2. Respuestas especializadas (paginated, created, noContent)
 * 3. Shortcuts para errores comunes (notFound, badRequest, etc)
 * -----------------------------------------------------------------------------
 * archivo : src/utils/response.util.js
 * creado el: 6-12-2025
 * =============================================================================
 */

const {createErrorResponse} = require('../constants/errors');

/**
 * RESPUESTA EXITOSA
 *------------------------------------------------------------------------------
 * formato estándar para respuestaxs exitosas
 *------------------------------------------------------------------------------
 * @param {Object} res - Objeto de respuesta Express
 * @param {*} data - Datos a enviar en la respuesta
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código de estado HTTP (por defecto 200)
 * -----------------------------------------------------------------------------
 * @example
 * //Ejemplo 1: Retornar datos de usuario
 * success(res, user, 'Usuario obtenido exitosamente');
 *------------------------------------------------------------------------------
 * //Ejemplo 2: Confirmar creación
 * success(res, newReserva, 'Reserva creada exitosamente', 201);
 * -----------------------------------------------------------------------------
 * //Ejemplo 3: Sin datos (solo confirmación)
 * success(res, null, 'Email enviado exitosamente');
 * -----------------------------------------------------------------------------
 */
const success = (res, data = null, message = 'Operación exitosa', statusCode = 200)=>{
    return res.status(statusCode).json({
        success: true,
        message,
        data
    })
};
/**
 * RESPUESTA DE ERROR
 * ------------------------------------------------------------------------------
 * Formato estándar para respuestas de error (4xx, 5xx).
 * -----------------------------------------------------------------------------
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP de error (default: 500)
 * @param {Object} details - Detalles adicionales del error (opcional)
 * -----------------------------------------------------------------------------
 * @example
 * // Ejemplo 1: Error simple
 * error(res, 'Usuario no encontrado', 404);
 * -----------------------------------------------------------------------------
 * // Ejemplo 2: Error con detalles (validación)
 * error(res, 'Datos inválidos', 400, {
 *   errors: [
 *     { field: 'email', message: 'Email inválido' },
 *     { field: 'password', message: 'Contraseña muy corta' }
 *   ]
 * });
 */
const error = (res, message = 'Error en el servidor', statusCode = 500, details = null) => {
    const response = {
        success: false,
        error: {
        message
        }
    };
    
    // Agregar detalles adicionales si existen
    if (details) {
        response.error.details = details;
    }
    
    return res.status(statusCode).json(response);
};

/**
 * RESPUESTA DE ERROR CON CÓDIGO ESTANDARIZADO
 * ------------------------------------------------------------------------------
 * Usa los códigos de error definidos en constants/errors.js
 * Esto asegura que los errores sean consistentes en toda la app.
 * ------------------------------------------------------------------------------
 * @param {Object} res - Objeto response de Express
 * @param {string} errorCode - Código de error de ERROR_CODES
 * @param {Object} additionalDetails - Detalles extra (opcional)
 * ------------------------------------------------------------------------------
 * @example
 * // Usando constantes de error
 * const { ERROR_CODES } = require('../constants/errors');
 * ------------------------------------------------------------------------------
 * // En tu controller:
 * errorWithCode(res, 'AUTH_USER_NOT_FOUND');
 * ------------------------------------------------------------------------------
 * // Con detalles adicionales:
 * errorWithCode(res, 'VAL_INVALID_INPUT', {
 *   fields: ['email', 'password']
 * });
 */
const errorWithCode = (res, errorCode, additionalDetails = null)=>{
    // Obtener el error completo desde las constantes
    const errorResponse = createErrorResponse(errorCode, additionalDetails);

    //Buscamos el codigo HTTP del catálogo
    const {ERROR_CODES} = require('../constants/errors');
    const errorDDefinition = ERROR_CODES[errorCode];
    const statusCode = errorDDefinition ? errorDDefinition.httpStatus : 500;

    // Retornar la respuesta de error estandarizada
    return res.status(statusCode).json(errorResponse);
};
/**
 * RESPUESTA PAGINADA
 * ------------------------------------------------------------------------------
 * Formato estándar para listas con paginación.
 * Incluye metadata útil para el frontend.
 * ------------------------------------------------------------------------------
 * @param {Object} res - Objeto response de Express
 * @param {Array} data - Array de items
 * @param {Object} pagination - Info de paginación
 * @param {number} pagination.page - Página actual
 * @param {number} pagination.limit - Items por página
 * @param {number} pagination.total - Total de items en BD
 * @param {string} message - Mensaje (opcional)
 * -----------------------------------------------------------------------------
 * @example
 * // En tu controller:
 * const page = parseInt(req.query.page) || 1;
 * const limit = parseInt(req.query.limit) || 10;
 * -----------------------------------------------------------------------------
 * const [rows, total] = await Promise.all([
 *   db.query('SELECT * FROM usuarios LIMIT ? OFFSET ?', [limit, (page-1)*limit]),
 *   db.query('SELECT COUNT(*) as total FROM usuarios')
 * ]);
 * -----------------------------------------------------------------------------
 * paginated(res, rows, {
 *   page,
 *   limit,
 *   total: total[0].total
 * });
 * -----------------------------------------------------------------------------
 * // Respuesta al cliente:
 * {
 *   success: true,
 *   message: "Datos obtenidos exitosamente",
 *   data: [...],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     total: 150,
 *     totalPages: 15,
 *     hasNext: true,
 *     hasPrev: false
 *   }
 * }
 */
const paginated = (res, data = [], pagination = {}, message = 'Datos obtenidos exitosamente')=>{
    const {page, limit, total } = pagination;

    //Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext,
            hasPrev
        }
    });
};
/**
 * RESPUESTA DE CREACIÓN EXITOSA (201)
 * ------------------------------------------------------------------------------
 * Shortcut para respuestas de creación de recursos.
 * ------------------------------------------------------------------------------
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Recurso creado
 * @param {string} message - Mensaje (opcional)
 * ------------------------------------------------------------------------------
 * @example
 * created(res, newUser, 'Usuario creado exitosamente');
 */
const created = (res, data, message = 'Recurso creado exitosamente') => {
    return success(res, data, message, 201);
};

/**
 * RESPUESTA SIN CONTENIDO (204)
 * ------------------------------------------------------------------------------
 * Para operaciones exitosas que no retornan datos (ej: DELETE).
 * ------------------------------------------------------------------------------
 * @param {Object} res - Objeto response de Express
 * ------------------------------------------------------------------------------
 * @example
 * // Después de eliminar un usuario:
 * noContent(res);
 */
const noContent = (res) => {
    return res.status(204).send();
};

/**
 * RESPUESTAS DE ERROR COMUNES (Shortcuts)
 * ------------------------------------------------------------------------------
 * Funciones convenientes para errores frecuentes.
 */

/**
 * 404 - No encontrado
 */
const notFound = (res, message = 'Recurso no encontrado') => {
    return error(res, message, 404);
};

/**
 * 400 - Petición inválida
 */
const badRequest = (res, message = 'Petición inválida', details = null) => {
    return error(res, message, 400, details);
};

/**
 * 401 - No autenticado
 */
const unauthorized = (res, message = 'No autenticado') => {
    return error(res, message, 401);
};

/**
 * 403 - No autorizado (tiene token pero no permiso)
 */
const forbidden = (res, message = 'No tienes permiso para esta acción') => {
    return error(res, message, 403);
};

/**
 * 409 - Conflicto (ej: email ya existe)
 */
const conflict = (res, message = 'Conflicto con recurso existente') => {
    return error(res, message, 409);
};

/**
 * 500 - Error del servidor
 */
const serverError = (res, message = 'Error interno del servidor') => {
    return error(res, message, 500);
};

// Exportar todas las funciones
module.exports = {
    // Respuestas basiicas
    success,
    error,
    errorWithCode,

    // Respuestas especializadas
    paginated,
    created,
    noContent,
// Shortcuts de errores comunes
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    conflict,
    serverError
};

