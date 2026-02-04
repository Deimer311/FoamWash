    /**
     * 🔐 CONTROLLER DE AUTENTICACIÓN
     */

    const usuarioModel = require('../models/usuario.model');
    const { hashPassword, comparePassword } = require('../utils/password.util');
    const { generateTokenPair } = require('../utils/jwt.util');
    const { ERROR_CODES } = require('../constants/errors');
    const { ROLES, getRoleIdByName } = require('../constants/roles');

    /**
     * REGISTRAR NUEVO USUARIO
     */
    const register = async (req, res) => {
    try {
        const { 
        nombre, 
        correo, 
        password, 
        telefono, 
        nDocumento, 
        direccion, 
        tipoDocumentoId,
        role 
        } = req.body;
        
        // Verificar que el email no exista
        const existingUser = await usuarioModel.findByEmail(correo);
        
        if (existingUser) {
        return res.status(409).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS.code,
            message: ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS.message
            }
        });
        }
        
        // Hashear contraseña
        const passwordHash = await hashPassword(password);
        
        // Determinar rol
        const userRole = role || ROLES.CLIENTE;
        const rolId = getRoleIdByName(userRole);
        
        // Crear usuario
        const newUser = await usuarioModel.create({
        nombre,
        correo,
        passwordHash,
        telefono,
        nDocumento,
        direccion,
        tipoDocumentoId,
        rolId,
        estado: 'activo'
        });
        
        // Generar tokens
        const tokens = generateTokenPair({
        id: newUser.id,
        correo: newUser.correo,
        role: userRole
        });
        
        await usuarioModel.updateLastLogin(newUser.id);
        
        return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
            user: newUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
        });
        
    } catch (error) {
        console.error('Error en register:', error);
        return res.status(500).json({
        success: false,
        error: {
            code: ERROR_CODES.SRV_INTERNAL_ERROR.code,
            message: 'Error al registrar usuario'
        }
        });
    }
    };

    /**
     * LOGIN
     */
    const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        
        const user = await usuarioModel.findByEmail(correo, true);
        
        if (!user) {
        return res.status(401).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_CREDENTIALS_INVALID.code,
            message: ERROR_CODES.AUTH_CREDENTIALS_INVALID.message
            }
        });
        }
        
        if (user.estado !== 'activo') {
        return res.status(403).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_ACCOUNT_DISABLED.code,
            message: ERROR_CODES.AUTH_ACCOUNT_DISABLED.message
            }
        });
        }
        
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        
        if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            error: {
            code: ERROR_CODES.AUTH_CREDENTIALS_INVALID.code,
            message: ERROR_CODES.AUTH_CREDENTIALS_INVALID.message
            }
        });
        }
        
        const roleName = await usuarioModel.getRoleName(user.rolId);
        
        const tokens = generateTokenPair({
        id: user.id,
        correo: user.correo,
        role: roleName
        });
        
        await usuarioModel.updateLastLogin(user.id);
        
        return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
            user: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            role: roleName
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
        success: false,
        error: {
            message: 'Error al iniciar sesión'
        }
        });
    }
    };

    /**
     * GET ME
     */
    const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await usuarioModel.findById(userId);
        
        if (!user) {
        return res.status(404).json({
            success: false,
            error: {
            message: 'Usuario no encontrado'
            }
        });
        }
        
        const roleName = await usuarioModel.getRoleName(user.rolId);
        
        return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: { ...user, role: roleName }
        });
        
    } catch (error) {
        console.error('Error en getMe:', error);
        return res.status(500).json({
        success: false,
        error: {
            message: 'Error al obtener perfil'
        }
        });
    }
    };

    module.exports = {
    register,
    login,
    getMe
    };