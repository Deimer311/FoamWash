/**
 * =============================================================================
 * CODIGOS DE ERROR ESTANDARIZADOS
 * este archivo define un conjunto de códigos de error estandarizados para
 * manejar errores en la aplicación. Cada código de error incluye un mensaje
 * descriptivo y un código HTTP asociado.
 * Cada error está categorizado para facilitar su identificación y manejo.
 * este enfoque ayuda a mantener la consistencia en la gestión de errores
 * a lo largo de toda la aplicación.
 * este archivo puede ser extendido con nuevos códigos de error según sea
 * necesario.
 * el archivo también incluye funciones para buscar errores por código y
 * para crear respuestas de error estandarizadas.
 * actualizado por última vez: 4 de diciembre de 2025
 * actualmente alojado en: src/constants/errores.js
 * =============================================================================
 */
const ERROR_CODES ={
    //==========================================================================
    // ERORES DE AUTENTICACION 
    //==========================================================================
    AUTH_TOKEN_NOT_PROVIDED:{
        code: 'AUTH_001',
        message: 'Token de autenticación no proporcionado.',
        statusCode: 401
    },
    AUTH_TOKEN_INVALID:{
        code: 'AUTH_002',
        message: 'Token de autenticación inválido.',
        statusCode: 401
    },
    AUTH_CREDENTIALS_INVALID:{
        code: 'AUTH_003',
        message: 'Email o contraseña inválidos.',
        statusCode: 401
    },
    AUTH_PERMISSION_DENIED: {
        code: 'AUTH_004',
        message: 'No tienes permiso para realizar esta acción',
        statusCode: 403
    },
    AUTH_EMAIL_ALREADY_EXISTS:{
        code: 'AUTH_005',
        message: 'El email ya está registrado.',
        statusCode: 409
    },
    AUTH_USER_NOT_FOUND: {
        code: 'AUTH_006',
        message: 'Usuario no encontrado',
        statusCode: 404
    },
    AUTH_ACCOUNT_DISABLED: {
        code: 'AUTH_007',
        message: 'Esta cuenta ha sido desactivada',
        statusCode: 403
    },
    //==========================================================================
    // ERORES DE VALIDACION DE DATOS
    //==========================================================================
    VAL_INVALID_INPUT: {
        code: 'VAL_001',
        message: 'Los datos ingresados son inválidos',
        statusCode: 400
    },
    VAL_INVALID_EMAIL: {
        code: 'VAL_002',
        message: 'El formato del email es inválido',
        statusCode: 400
    },
    VAL_PASSWORD_TOO_SHORT: {
        code: 'VAL_003',
        message: 'La contraseña debe tener al menos 6 caracteres',
        statusCode: 400
    },
    VAL_REQUIRED_FIELD: {
        code: 'VAL_004',
        message: 'Faltan campos requeridos',
        statusCode: 400
    },
    VAL_INVALID_PHONE: {
        code: 'VAL_005',
        message: 'El número de teléfono debe tener 10 dígitos',
        statusCode: 400
    },
    VAL_INVALID_DATE: {
        code: 'VAL_006',
        message: 'La fecha proporcionada es inválida',
        statusCode: 400
    },
    VAL_INVALID_ROLE: {
        code: 'VAL_007',
        message: 'El rol especificado no es válido',
        statusCode: 400
    },
    //==========================================================================
    // RECURSOS
    //==========================================================================
    RES_NOT_FOUND: {
        code: 'RES_001',
        message: 'El recurso solicitado no fue encontrado',
        statusCode: 404
    },
    RES_CONFLICT: {
        code: 'RES_002',
        message: 'Conflicto con un recurso existente',
        statusCode: 409
    },
    RES_ALREADY_EXISTS: {
        code: 'RES_003',
        message: 'El recurso ya existe',
        statusCode: 409
    },
    //==========================================================================
    // BASE DE DATOS
    //==========================================================================
    DB_CONNECTION_ERROR: {
        code: 'DB_001',
        message: 'Error de conexión a la base de datos',
        statusCode: 500
    },
    DB_QUERY_ERROR: {
        code: 'DB_002',
        message: 'Error al ejecutar la consulta',
        statusCode: 500
    },
    DB_CONSTRAINT_VIOLATION: {
        code: 'DB_003',
        message: 'Violación de restricción de base de datos',
        statusCode: 400
    },
    //==========================================================================
    // ERRORES DEL SERVIDOR
    //==========================================================================
    SRV_INTERNAL_ERROR: {
        code: 'SRV_001',
        message: 'Error interno del servidor',
        statusCode: 500
    },
    SRV_SERVICE_UNAVAILABLE: {
        code: 'SRV_002',
        message: 'Servicio temporalmente no disponible',
        statusCode: 503
    },
    //==========================================================================
    // RATE LIMITING
    //==========================================================================
    RATE_LIMIT_EXCEEDED: {
        code: 'RATE_001',
        message: 'Demasiadas peticiones, intenta de nuevo más tarde',
        statusCode: 429
    },
    RATE_AUTH_LIMIT_EXCEEDED: {
        code: 'RATE_002',
        message: 'Demasiados intentos de inicio de sesión, intenta en 15 minutos',
        statusCode: 429
    }
};
//==============================================================================
// BUSCAR ERROR POR CÓDIGO
//==============================================================================
const getErrorByCode = (code) => {
    return Object.values(ERROR_CODES).find(error => error.code === code) || ERROR_CODES.SRV_INTERNAL_ERROR;
};

//==============================================================================
// CREAR RESPUESTA DE ERROR ESTANDARIZADA
//==============================================================================
const createErrorResponse = (errorCode, additionalDetails = null) => {
    const error = ERROR_CODES[errorCode] || ERROR_CODES.SRV_INTERNAL_ERROR;
    
    const response = {
        success: false,
        error: {
        code: error.code,
        message: error.message
        }
    };

    // Agregar detalles adicionales si existen (útil para validaciones)
    if (additionalDetails) {
        response.error.details = additionalDetails;
    }

    return response;
    };

    module.exports = {
    ERROR_CODES,
    getErrorByCode,
    createErrorResponse
};