/**
 * 🎫 UTILIDADES DE JWT (JSON Web Tokens)
 *
 * JWT es el método estándar para manejar autenticación stateless (sin sesiones en servidor).
 * Un token JWT tiene 3 partes separadas por puntos: HEADER.PAYLOAD.SIGNATURE
 *------------------------------------------------------------------------------
 * Ejemplo de token:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *------------------------------------------------------------------------------
 * ¿Por qué JWT?
 * - Stateless: No necesitamos guardar sesiones en el servidor
 * - Portable: Se puede usar en web, mobile, microservicios
 * - Seguro: Firmado digitalmente para prevenir manipulación
 * -----------------------------------------------------------------------------
 * Este módulo proporciona funciones para:
 * - Generar tokens de acceso (access tokens) y refresh tokens
 * - Verificar y decodificar tokens
 * - Manejar expiración y renovación de tokens
 *
 * Buenas prácticas:
 * - Usar access tokens de corta duración (ej. 7 días)
 * - Usar refresh tokens para obtener nuevos access tokens
 * - Almacenar tokens de forma segura (httpOnly cookies o almacenamiento seguro)
 * - Nunca exponer el secreto de firma en el código fuente
 * - Rotar secretos periódicamente
 * -----------------------------------------------------------------------------
 * el archivo esta alojado en src/utils/jwt.util.js
 * este archivo fue creado el dia 6-12-2025.
 */

const jwt = require('jsonwebtoken');

/**}
 * GENERAR UN TOKEN DE ACCESO (Access Token)
 *
 * Crear un JWT que se usa para autenticar peticiones a la API.
 * Tiene una duracion corta (7 dias por defecto) por seguridad.
 *
 * @param {Object} payload - Datos que se incluirán en el token
 * @param {string} payload.id - ID único del usuario
 * @param {string} payload.email - Email del usuario
 * @param {string} payload.role - Rol del usuario (admin, trabajador, cliente)
 * @returns {string} - Token JWT firmado
 *
 * @example
 * const token = generateAccessToken({
 *   id: 'uuid-123',
 *   email: 'usuario@ejemplo.com',
 *   role: 'cliente'
 * });
 *
 * // El token se envía al cliente y él lo guarda (localStorage, cookie, etc)
 * // En cada petición, el cliente lo envía en el header: Authorization: Bearer <token>
 */

const generateAccessToken = (payload) => {
    try {
        // Validación: asegurar que los campos obligatorios estén presentes
        if (!payload.id || !payload.email || !payload.role) {
            throw new Error('El payload debe contener: id, email y role');
        }
        
        // Obtener el secreto desde variables de entorno
        // NUNCA hardcodear el secreto en el código
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error('JWT_SECRET no está configurado en .env');
        }
        
        // Opciones del token
        const options = {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d', // Duración del token
            issuer: 'foamwash-api', // Quién emitió el token (tu app)
            audience: 'foamwash-client' // Para quién es el token (tu frontend)
        };
        
        // Generar el token
        // jwt.sign combina el payload con el secreto y crea la firma
        const token = jwt.sign(payload, secret, options);
        
        return token;
        
    } catch (error) {
        throw new Error(`Error al generar token de acceso: ${error.message}`);
    }
};

    /**
     * 🔄 GENERAR REFRESH TOKEN
     * 
     * Token de larga duración (30 días) que se usa SOLO para obtener nuevos access tokens.
     * El cliente NO lo usa para hacer peticiones a la API.
     * 
     * Flujo:
     * 1. Usuario hace login → Recibe accessToken (7d) y refreshToken (30d)
     * 2. Access token expira después de 7 días
     * 3. Cliente envía refreshToken para obtener nuevo accessToken
     * 4. Sistema valida refreshToken y genera nuevo accessToken
     * 
     * @param {Object} payload - Datos básicos del usuario
     * @param {string} payload.id - ID del usuario
     * @returns {string} - Refresh token JWT
     * 
     * @example
     * const refreshToken = generateRefreshToken({ id: 'uuid-123' });
     * // Este token se guarda de forma segura (httpOnly cookie o base de datos)
     */
    const generateRefreshToken = (payload) => {
    try {
        // Validación básica
        if (!payload.id) {
            throw new Error('El payload debe contener al menos el id del usuario');
        }
        
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        
        if (!secret) {
        throw new Error('JWT_REFRESH_SECRET no está configurado en .env');
        }
        
        const options = {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
            issuer: 'foamwash-api'
        };
        
        // El refresh token tiene menos información por seguridad
        // Solo incluye el ID para identificar al usuario
        const minimalPayload = {
            id: payload.id,
            type: 'refresh' // Marcamos el tipo de token
        };
        
        const token = jwt.sign(minimalPayload, secret, options);
        
        return token;
        
    } catch (error) {
        throw new Error(`Error al generar refresh token: ${error.message}`);
    }
    };

    /**
     * ✅ VERIFICAR Y DECODIFICAR TOKEN
     * 
     * Valida la firma del token y extrae el payload.
     * Si el token fue manipulado o expiró, lanzará un error.
     * 
     * @param {string} token - Token JWT a verificar
     * @param {boolean} isRefreshToken - Si es true, usa JWT_REFRESH_SECRET
     * @returns {Object} - Payload decodificado del token
     * 
     * @throws {Error} - Si el token es inválido, expiró o fue manipulado
     * 
     * @example
     * try {
     *   const decoded = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
     *   console.log(decoded);
     *   // { id: 'uuid-123', email: 'user@example.com', role: 'cliente', iat: 1234567890, exp: 1234567890 }
     * } catch (error) {
     *   console.log('Token inválido o expirado');
     * }
     */
    const verifyToken = (token, isRefreshToken = false) => {
    try {
        // Validación: asegurar que el token existe
        if (!token) {
            throw new Error('Token no proporcionado');
        }
        
        // Seleccionar el secreto correcto según el tipo de token
        const secret = isRefreshToken 
        ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
        : process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error('JWT_SECRET no está configurado');
        }
        
        // jwt.verify hace dos cosas:
        // 1. Verifica que la firma sea válida (que no fue manipulado)
        // 2. Verifica que no haya expirado
        const decoded = jwt.verify(token, secret);
        
        // Verificar que el token no haya sido emitido en el futuro (iat = issued at)
        const now = Math.floor(Date.now() / 1000);
        if (decoded.iat > now) {
            throw new Error('Token emitido en el futuro');
        }
        
        return decoded;
        
    } catch (error) {
        // jwt.verify lanza diferentes tipos de errores:
        // - TokenExpiredError: El token expiró
        // - JsonWebTokenError: Token malformado o firma inválida
        // - NotBeforeError: Token usado antes de tiempo
        
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        } else {
            throw new Error(`Error al verificar token: ${error.message}`);
        }
    }
    };

    /**
     * 🔓 DECODIFICAR TOKEN SIN VERIFICAR
     * 
     * Extrae el payload del token SIN verificar la firma.
     * ⚠️ PELIGROSO: Solo usar para debugging o cuando no importa la seguridad.
     * NO usar esto para tomar decisiones de autenticación.
     * 
     * @param {string} token - Token JWT
     * @returns {Object|null} - Payload decodificado o null si es inválido
     * 
     * @example
     * const payload = decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
     * console.log(payload);
     * // { id: 'uuid-123', email: 'user@example.com', role: 'cliente' }
     * 
     * // Útil para debugging o mostrar info del usuario antes de verificar
     */
    const decodeToken = (token) => {
    try {
        // jwt.decode NO verifica la firma, solo decodifica el Base64
            const decoded = jwt.decode(token);
            return decoded;
    } catch (error) {
        return null;
    }
    };

    /**
     * ⏰ OBTENER TIEMPO DE EXPIRACIÓN
     * 
     * Calcula cuánto tiempo falta para que expire el token.
     * 
     * @param {string} token - Token JWT
     * @returns {Object} - { expired: boolean, expiresIn: number (segundos), expiresAt: Date }
     * 
     * @example
     * const expirationInfo = getTokenExpiration('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
     * console.log(expirationInfo);
     * // { expired: false, expiresIn: 604800, expiresAt: Date('2025-12-13') }
     */
    const getTokenExpiration = (token) => {
    try {
        const decoded = decodeToken(token);
        
        if (!decoded || !decoded.exp) {
        return { expired: true, expiresIn: 0, expiresAt: null };
        }
        
        const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        const expiresIn = decoded.exp - now; // Segundos restantes
        
        return {
            expired: expiresIn <= 0,
            expiresIn: Math.max(0, expiresIn),
            expiresAt: new Date(decoded.exp * 1000) // Convertir a Date object
        };
        
    } catch (error) {
        return { expired: true, expiresIn: 0, expiresAt: null };
    }
    };

    /**
     * 🎫 GENERAR PAR DE TOKENS (Access + Refresh)
     * 
     * Método conveniente para generar ambos tokens de una vez.
     * Se usa típicamente en login y registro.
     * 
     * @param {Object} payload - Datos del usuario
     * @returns {Object} - { accessToken: string, refreshToken: string }
     * 
     * @example
     * const tokens = generateTokenPair({
     *   id: 'uuid-123',
     *   email: 'usuario@ejemplo.com',
     *   role: 'cliente'
     * });
     * 
     * // Respuesta al cliente:
     * res.json({
     *   success: true,
     *   accessToken: tokens.accessToken,   // → Cliente guarda en memoria o localStorage
     *   refreshToken: tokens.refreshToken  // → Cliente guarda en httpOnly cookie (más seguro)
     * });
     */
    const generateTokenPair = (payload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken({ id: payload.id })
    };
    };

    // Exportar todas las funciones
        module.exports = {
        generateAccessToken,
        generateRefreshToken,
        verifyToken,
        decodeToken,
        getTokenExpiration,
        generateTokenPair
    };