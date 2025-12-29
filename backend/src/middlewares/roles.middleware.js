    /**
     * =========================================================================
     * 👥 MIDDLEWARE DE CONTROL DE ROLES (RBAC)
     * -------------------------------------------------------------------------
     * Role-Based Access Control: Restringe acceso basado en el rol del usuario.
     * Este middleware debe usarse DESPUÉS del middleware protect.
     * -------------------------------------------------------------------------
     * archivo src/middlewares/roles.middleware.js
     * creado el dia 26 de diciembre del 2025
     * por cristian andres criollo tovar
     * fecha de ultima modificacion: 26 de diciembre del 2025 realizada por cristian andres criollo tovar
     * =========================================================================
     */

    const { forbidden } = require('../utils/response.util');
    const { ROLES, hasHigherOrEqualRole } = require('../constants/roles');

    /**
     * 🚫 RESTRINGIR A ROLES ESPECÍFICOS
     * 
     * Solo permite acceso a usuarios con los roles especificados.
     * 
     * @param {...string} allowedRoles - Roles permitidos
     * @returns {Function} - Middleware de Express
     * 
     * @example
     * // Solo admin puede acceder
     * router.delete('/usuarios/:id', protect, restrictTo('admin'), deleteUser);
     * 
     * // Admin o trabajador pueden acceder
     * router.get('/reservas', protect, restrictTo('admin', 'trabajador'), getReservas);
     * 
     * // Todos los autenticados pueden acceder (no usar restrictTo)
     * router.get('/perfil', protect, getProfile);
     */
    const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que req.user existe (debe haber pasado por protect)
        if (!req.user) {
        return forbidden(res, 'Debes estar autenticado para acceder a este recurso');
        }
        
        // Verificar que el rol del usuario está en los roles permitidos
        if (!allowedRoles.includes(req.user.role)) {
        return forbidden(
            res, 
            `Solo usuarios con rol ${allowedRoles.join(' o ')} pueden acceder a este recurso`
        );
        }
        
        // Usuario tiene el rol correcto, continuar
        next();
    };
    };

    /**
     * 🔓 PERMITIR SI ES DUEÑO O ADMIN
     * 
     * Permite acceso si:
     * 1. Es el mismo usuario (dueño del recurso)
     * 2. Es admin
     * 
     * @example
     * // Usuario puede ver su propio perfil, admin puede ver cualquier perfil
     * router.get('/usuarios/:id', protect, allowOwnerOrAdmin, getUser);
     */
    const allowOwnerOrAdmin = (req, res, next) => {
    try {
        const requestedId = parseInt(req.params.id);
        const authenticatedUserId = parseInt(req.user.id);
        
        // Permitir si es admin
        if (req.user.role === ROLES.ADMIN) {
        return next();
        }
        
        // Permitir si es el mismo usuario
        if (requestedId === authenticatedUserId) {
        return next();
        }
        
        // No es dueño ni admin
        return forbidden(res, 'No tienes permiso para acceder a este recurso');
        
    } catch (error) {
        console.error('Error en allowOwnerOrAdmin:', error);
        return res.status(500).json({
        success: false,
        error: {
            message: 'Error al verificar permisos'
        }
        });
    }
    };

    /**
     * 🎯 VERIFICAR JERARQUÍA DE ROLES
     * 
     * Permite acceso solo si el usuario tiene un rol con jerarquía igual o superior.
     * 
     * @param {string} minimumRole - Rol mínimo requerido
     * @returns {Function} - Middleware de Express
     * 
     * @example
     * // Solo admin o trabajador (no cliente)
     * router.get('/dashboard', protect, requireMinimumRole('trabajador'), getDashboard);
     */
    const requireMinimumRole = (minimumRole) => {
    return (req, res, next) => {
        if (!req.user) {
        return forbidden(res, 'Debes estar autenticado');
        }
        
        // Verificar jerarquía
        if (!hasHigherOrEqualRole(req.user.role, minimumRole)) {
        return forbidden(
            res,
            `Necesitas permisos de ${minimumRole} o superior para acceder a este recurso`
        );
        }
        
        next();
    };
    };

    /**
     * 📋 FILTRAR DATOS SEGÚN ROL
     * 
     * Middleware que agrega funciones helper a req para filtrar datos.
     * Útil para endpoints donde diferentes roles ven diferentes datos.
     * 
     * @example
     * router.get('/reservas', protect, addRoleHelpers, async (req, res) => {
     *   let query = 'SELECT * FROM reservas';
     *   
     *   if (req.isCliente()) {
     *     query += ' WHERE cliente_id = ?';
     *   } else if (req.isTrabajador()) {
     *     query += ' WHERE trabajador_id = ?';
     *   }
     *   // Admin ve todas
     * });
     */
    const addRoleHelpers = (req, res, next) => {
    if (!req.user) {
        return forbidden(res, 'Debes estar autenticado');
    }
    
    // Agregar funciones helper
    req.isAdmin = () => req.user.role === ROLES.ADMIN;
    req.isTrabajador = () => req.user.role === ROLES.TRABAJADOR;
    req.isCliente = () => req.user.role === ROLES.CLIENTE;
    
    next();
    };

    module.exports = {
    restrictTo,
    allowOwnerOrAdmin,
    requireMinimumRole,
    addRoleHelpers
    };