    /**
     * =========================================================================
     * 🔐 MIDDLEWARE DE AUTENTICACIÓN
     * -------------------------------------------------------------------------
     * Este middleware protege las rutas que requieren autenticación.
     * Verifica que el usuario tenga un token JWT válido.
     * -------------------------------------------------------------------------
     * Flujo:
     * 1. Cliente envía request con header: Authorization: Bearer <token>
     * 2. Middleware extrae y verifica el token
     * 3. Si es válido, agrega los datos del usuario a req.user
     * 4. Si no es válido, retorna error 401
     * -------------------------------------------------------------------------
     * archivo src/middlewares/auth.middleware.js
     * creado el dia 26 de diciembre del 2025
     * por cristian andres criollo tovar
     * fecha de la ultima modificacion: 26 de diciembre del 2025 realizada por cristian andres criollo tovar
     * =========================================================================
     */

    const { verifyToken } = require('../utils/jwt.util');
    const { unauthorized, forbidden } = require('../utils/response.util');
    const { ERROR_CODES } = require('../constants/errors');
    const usuarioModel = require('../models/usuario.model');

    /**
     * 🛡️ PROTEGER RUTA (Require Authentication)
     * 
     * Middleware que verifica que el usuario esté autenticado.
     * Debe usarse en todas las rutas que requieren login.
     * 
     * @example
     * // En tus rutas:
     * router.get('/perfil', protect, getProfile);
     * router.post('/reservas', protect, createReserva);
     */
    const protect = async (req, res, next) => {
    try {
        // 1. Verificar que el header Authorization exista
        let token;
        
        if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
        ) {
        // Extraer token del header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        token = req.headers.authorization.split(' ')[1];
        }
        
        // Si no hay token, denegar acceso
        if (!token) {
        return res.status(401).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_TOKEN_NOT_PROVIDED.code,
            message: ERROR_CODES.AUTH_TOKEN_NOT_PROVIDED.message
            }
        });
        }
        
        // 2. Verificar y decodificar el token
        let decoded;
        try {
        decoded = verifyToken(token);
        } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_TOKEN_INVALID.code,
            message: ERROR_CODES.AUTH_TOKEN_INVALID.message
            }
        });
        }
        
        // 3. Verificar que el usuario aún existe en la BD
        const user = await usuarioModel.findById(decoded.id);
        
        if (!user) {
        return res.status(401).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_USER_NOT_FOUND.code,
            message: 'El usuario de este token ya no existe'
            }
        });
        }
        
        // 4. Verificar que la cuenta esté activa
        if (user.estado !== 'activo') {
        return res.status(403).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_ACCOUNT_DISABLED.code,
            message: ERROR_CODES.AUTH_ACCOUNT_DISABLED.message
            }
        });
        }
        
        // 5. Obtener el nombre del rol
        const roleName = await usuarioModel.getRoleName(user.rolId);
        
        // 6. Agregar usuario completo a req.user para usar en controllers
        req.user = {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        rolId: user.rolId,
        role: roleName, // 'admin', 'trabajador', 'cliente'
        estado: user.estado
        };
        
        // 7. Continuar al siguiente middleware o controller
        next();
        
    } catch (error) {
        console.error('Error en middleware protect:', error);
        return res.status(500).json({
        success: false,
        error: {
            code: ERROR_CODES.SRV_INTERNAL_ERROR.code,
            message: 'Error al verificar autenticación'
        }
        });
    }
    };

    /**
     * 🔐 PROTEGER RUTA (Opcional - Solo agrega user si hay token)
     * 
     * Similar a protect, pero NO bloquea si no hay token.
     * Útil para rutas que funcionan diferente con/sin autenticación.
     * 
     * @example
     * // Ruta que muestra más info si estás logueado
     * router.get('/servicios', optionalAuth, getServicios);
     */
    const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
        ) {
        token = req.headers.authorization.split(' ')[1];
        }
        
        // Si no hay token, simplemente continuar sin agregar req.user
        if (!token) {
        return next();
        }
        
        // Si hay token, intentar verificarlo
        try {
        const decoded = verifyToken(token);
        const user = await usuarioModel.findById(decoded.id);
        
        if (user && user.estado === 'activo') {
            const roleName = await usuarioModel.getRoleName(user.rolId);
            
            req.user = {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            rolId: user.rolId,
            role: roleName,
            estado: user.estado
            };
        }
        } catch (error) {
        // Si el token es inválido, simplemente continuar sin user
        console.log('Token inválido en optionalAuth, continuando sin usuario');
        }
        
        next();
        
    } catch (error) {
        console.error('Error en middleware optionalAuth:', error);
        next(); // Continuar aunque haya error
    }
    };

    /**
     * 🔒 VERIFICAR QUE ES EL MISMO USUARIO
     * 
     * Verifica que el usuario solo pueda acceder a sus propios datos.
     * El ID en la URL debe coincidir con el ID del usuario autenticado.
     * 
     * @example
     * // Solo puedes ver/editar tu propio perfil
     * router.get('/usuarios/:id', protect, checkOwnership, getUser);
     * router.put('/usuarios/:id', protect, checkOwnership, updateUser);
     */
    const checkOwnership = (req, res, next) => {
    try {
        // El ID en la URL debe coincidir con el ID del usuario autenticado
        const requestedId = parseInt(req.params.id);
        const authenticatedUserId = parseInt(req.user.id);
        
        // Admin puede acceder a cualquier usuario
        if (req.user.role === 'admin') {
        return next();
        }
        
        // Usuario solo puede acceder a sus propios datos
        if (requestedId !== authenticatedUserId) {
        return forbidden(res, 'Solo puedes acceder a tus propios datos');
        }
        
        next();
        
    } catch (error) {
        console.error('Error en middleware checkOwnership:', error);
        return res.status(500).json({
        success: false,
        error: {
            message: 'Error al verificar permisos'
        }
        });
    }
    };

    module.exports = {
    protect,
    optionalAuth,
    checkOwnership
    };