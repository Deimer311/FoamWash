    /**=========================================================================
     * ✅ MIDDLEWARE DE VALIDACIÓN
     * -------------------------------------------------------------------------
     * Maneja los resultados de express-validator y retorna errores formateados.
     * -------------------------------------------------------------------------
     * este archivo esta guardado en: src/middlewares/validation.middleware.js
     * creado el dia 26 de diciembre del 2025
     * por cristian andres criollo tovar
     * fecha de la ultima modificacion: 26 de diciembre del 2025 modificado por cristian andres criollo tovar
     * =========================================================================
     */

    const { validationResult } = require('express-validator');
    const { badRequest } = require('../utils/response.util');
    const { ERROR_CODES } = require('../constants/errors');

    /**
     * 📝 VALIDAR REQUEST
     * 
     * Ejecuta las validaciones de express-validator y retorna errores si hay.
     * 
     * @param {Array} validations - Array de validaciones de express-validator
     * @returns {Function} - Middleware de Express
     * 
     * @example
     * const { body } = require('express-validator');
     * 
     * const loginValidation = [
     *   body('correo').isEmail().withMessage('Email inválido'),
     *   body('password').notEmpty().withMessage('Password requerido')
     * ];
     * 
     * router.post('/login', validate(loginValidation), login);
     */
    const validate = (validations) => {
    return async (req, res, next) => {
        // Ejecutar todas las validaciones
        await Promise.all(validations.map(validation => validation.run(req)));
        
        // Obtener errores
        const errors = validationResult(req);
        
        if (errors.isEmpty()) {
        return next(); // No hay errores, continuar
        }
        
        // Formatear errores
        const formattedErrors = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
        }));
        
        // Retornar respuesta de error
        return res.status(400).json({
        success: false,
        error: {
            code: ERROR_CODES.VAL_INVALID_INPUT.code,
            message: 'Datos de entrada inválidos',
            details: formattedErrors
        }
        });
    };
    };

    /**
     * 🔍 SANITIZAR REQUEST BODY
     * 
     * Limpia caracteres potencialmente peligrosos del body.
     * Previene XSS (Cross-Site Scripting).
     * 
     * @example
     * router.post('/usuarios', sanitizeBody, createUser);
     */
    const sanitizeBody = (req, res, next) => {
    if (req.body) {
        // Función recursiva para limpiar objetos
        const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
            // Remover tags HTML y scripts
            obj[key] = obj[key]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitize(obj[key]); // Recursivo para objetos anidados
            }
        }
        };
        
        sanitize(req.body);
    }
    
    next();
    };

    module.exports = {
    validate,
    sanitizeBody
    };