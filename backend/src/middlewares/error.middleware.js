    /**
     * =============================================================================
     * MIDDLEWARE DE MANEJO DE ERRORES
     * -----------------------------------------------------------------------------
     * Este middleware captura todos los errores de la aplicacion
     * y retorna respuestas formateadas consistentes.
     * -----------------------------------------------------------------------------
     * IMPORTANTE: Debe ser el ÚLTIMO middleware en server.js
     * =============================================================================
     */
    const {ERROR_CODES } = require('../constants/errors.js');

    /**
     * MANEJADOR GLOBAL DE ERRORES
     * -----------------------------------------------------------------------------
     * Captura cualquier error lanzado en la aplicación.
     *
     * @param {Error} err - Objeto de error
     * @param {Object} req - Request de Express
     * @param {Object} res -Response de Express
     * @param {Function} next - Next middleware
     */
    const errorHandler = (err, req, res, next) => {
    // Log del error en consola (en desarrollo)
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error capturado:');
        console.error('Mensaje:', err.message);
        console.error('Stack:', err.stack);
    }
    
    // Determinar código de estado
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || ERROR_CODES.SRV_INTERNAL_ERROR.code;
    let message = err.message || 'Error interno del servidor';
    
    // Manejo de errores específicos de MySQL
    if (err.code && err.code.startsWith('ER_')) {
        statusCode = 500;
        
        switch (err.code) {
        case 'ER_DUP_ENTRY':
            statusCode = 409;
            errorCode = ERROR_CODES.RES_CONFLICT.code;
            message = 'Ya existe un registro con esos datos';
            break;
            
        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
            statusCode = 400;
            errorCode = ERROR_CODES.VAL_INVALID_INPUT.code;
            message = 'Referencia inválida a otro registro';
            break;
            
        case 'ER_BAD_FIELD_ERROR':
            statusCode = 500;
            message = 'Error en la consulta a la base de datos';
            break;
            
        default:
            message = 'Error de base de datos';
        }
    }
    
    // Construir respuesta de error
    const errorResponse = {
        success: false,
        error: {
        code: errorCode,
        message: message
        }
    };
    
    // Agregar stack trace solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = err.stack;
    }
    
    // Enviar respuesta
    res.status(statusCode).json(errorResponse);
    };

    /**
     * 🔍 MANEJADOR DE RUTAS NO ENCONTRADAS (404)
     * 
     * Captura peticiones a rutas que no existen.
     * Debe colocarse ANTES del errorHandler en server.js
     * 
     * @example
     * // En server.js:
     * app.use(notFound);
     * app.use(errorHandler);
     */
    const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    error.code = ERROR_CODES.RES_NOT_FOUND.code;
    next(error);
    };

    /**
     * 🔄 WRAPPER PARA ASYNC FUNCTIONS
     * 
     * Envuelve funciones async para capturar errores automáticamente.
     * Evita tener que escribir try-catch en cada controller.
     * 
     * @param {Function} fn - Función async
     * @returns {Function} - Función envuelta
     * 
     * @example
     * // Sin catchAsync:
     * const getUsers = async (req, res) => {
     *   try {
     *     const users = await userModel.findAll();
     *     res.json(users);
     *   } catch (error) {
     *     next(error);
     *   }
     * };
     * 
     * // Con catchAsync:
     * const getUsers = catchAsync(async (req, res) => {
     *   const users = await userModel.findAll();
     *   res.json(users);
     * });
     */
    const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
    };

    module.exports = {
    errorHandler,
    notFound,
    catchAsync
    };

