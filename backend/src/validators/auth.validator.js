/**
 * =============================================================================
 * VALIDADOR DE AUTENTIFICACION
 * -----------------------------------------------------------------------------
 * Define las reglas de validacion para endpoints de autentificacion.}
 * Usa express-validator para validar datos de entrada.
 * =============================================================================
 */
const { body } = require('express-validator');
const { ROLES, getAllRoles } = require('../constants/roles');
/**
 * VALIDACION DE REGISTRO
 */

const registerValidation =[
    body('nombre')
        .trim()

    .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    
    body('correo')
        .trim()
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .normalizeEmail()
        .isLength({ max: 100 }).withMessage('El correo no puede exceder 100 caracteres'),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres')
        // Validación opcional de complejidad (descomenta si la necesitas):
        // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        // .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    ,
    
    body('telefono')
        .trim()
        .notEmpty().withMessage('El teléfono es requerido')
        .matches(/^[0-9]{10}$/).withMessage('El teléfono debe tener exactamente 10 dígitos'),
    
    body('nDocumento')
        .trim()
        .notEmpty().withMessage('El número de documento es requerido')
        .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres')
        .matches(/^[0-9a-zA-Z-]+$/).withMessage('El número de documento solo puede contener letras, números y guiones'),
    
    body('direccion')
        .trim()
        .notEmpty().withMessage('La dirección es requerida')
        .isLength({ min: 10, max: 100 }).withMessage('La dirección debe tener entre 10 y 100 caracteres'),
    
    body('tipoDocumentoId')
        .notEmpty().withMessage('El tipo de documento es requerido')
        .isInt({ min: 1 }).withMessage('El tipo de documento debe ser un ID válido'),
    
    // El rol es opcional, si no se proporciona, será 'cliente' por defecto
    body('role')
        .optional()
        .isIn(getAllRoles()).withMessage(`El rol debe ser uno de: ${getAllRoles().join(', ')}`)
];

    const loginValidation = [
    body('correo')
        .trim()
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
    ];

    // EXPORTAR AL FINAL
    module.exports = {
    registerValidation,
    loginValidation
    };