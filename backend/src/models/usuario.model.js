    /**
     * 👤 MODELO DE USUARIO
     * 
     * Maneja todas las operaciones de base de datos relacionadas con usuarios.
     * Actúa como capa de abstracción entre los controllers y la BD.
     */

    const { pool, mapDbToApp, mapAppToDb, excludeSensitiveFields } = require('../config/database');

    /**
     * 🔍 BUSCAR USUARIO POR EMAIL
     * 
     * Usado principalmente para login y registro (verificar si email existe).
     * 
     * @param {string} correo - Email del usuario
     * @param {boolean} includeSensitive - Si incluir campos sensibles (password, tokens)
     * @returns {Promise<Object|null>} - Usuario encontrado o null
     */
    const findByEmail = async (correo, includeSensitive = false) => {
    try {
        const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE Correo = ? AND estado = "activo"',
        [correo]
        );
        
        if (rows.length === 0) return null;
        
        const user = mapDbToApp(rows[0]);
        
        // Si no necesitamos campos sensibles, los excluimos
        return includeSensitive ? user : excludeSensitiveFields(user);
        
    } catch (error) {
        throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
    };

    /**
     * 🔍 BUSCAR USUARIO POR ID
     * 
     * @param {number} id - ID del usuario
     * @param {boolean} includeSensitive - Si incluir campos sensibles
     * @returns {Promise<Object|null>} - Usuario encontrado o null
     */
    const findById = async (id, includeSensitive = false) => {
    try {
        const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE Id_Usuario = ? AND estado = "activo"',
        [id]
        );
        
        if (rows.length === 0) return null;
        
        const user = mapDbToApp(rows[0]);
        
        return includeSensitive ? user : excludeSensitiveFields(user);
        
    } catch (error) {
        throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
    };

    /**
     * ➕ CREAR NUEVO USUARIO
     * 
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.nombre - Nombre completo
     * @param {string} userData.correo - Email
     * @param {string} userData.passwordHash - Password hasheado
     * @param {string} userData.telefono - Teléfono
     * @param {string} userData.nDocumento - Número de documento
     * @param {string} userData.direccion - Dirección
     * @param {number} userData.rolId - ID del rol (1=admin, 2=trabajador, 3=cliente)
     * @param {number} userData.tipoDocumentoId - ID del tipo de documento
     * @returns {Promise<Object>} - Usuario creado (sin campos sensibles)
     */
    const create = async (userData) => {
    try {
        // Convertir datos de app a formato de BD
        const dbData = mapAppToDb(userData);
        
        // Insertar en BD
        const [result] = await pool.query(
        `INSERT INTO usuarios SET ?`,
        [dbData]
        );
        
        // Obtener el usuario recién creado
        const newUser = await findById(result.insertId);
        
        return newUser;
        
    } catch (error) {
        // Manejo de errores específicos
        if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El correo ya está registrado');
        }
        throw new Error(`Error al crear usuario: ${error.message}`);
    }
    };

    /**
     * 🔄 ACTUALIZAR USUARIO
     * 
     * @param {number} id - ID del usuario
     * @param {Object} updates - Campos a actualizar
     * @returns {Promise<Object>} - Usuario actualizado
     */
    const update = async (id, updates) => {
    try {
        // Convertir datos a formato de BD
        const dbData = mapAppToDb(updates);
        
        // Verificar que hay datos para actualizar
        if (Object.keys(dbData).length === 0) {
        throw new Error('No hay datos para actualizar');
        }
        
        // Actualizar en BD
        await pool.query(
        'UPDATE usuarios SET ? WHERE Id_Usuario = ?',
        [dbData, id]
        );
        
        // Retornar usuario actualizado
        return await findById(id);
        
    } catch (error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
    };

    /**
     * 🔐 ACTUALIZAR ÚLTIMO LOGIN
     * 
     * Se llama cada vez que un usuario inicia sesión exitosamente.
     * 
     * @param {number} id - ID del usuario
     * @returns {Promise<void>}
     */
    const updateLastLogin = async (id) => {
    try {
        await pool.query(
        'UPDATE usuarios SET last_login = NOW() WHERE Id_Usuario = ?',
        [id]
        );
    } catch (error) {
        // No lanzamos error aquí porque no queremos que falle el login
        // solo por no poder actualizar el last_login
        console.error('Error al actualizar last_login:', error.message);
    }
    };

    /**
     * 🔑 GUARDAR TOKEN DE RECUPERACIÓN
     * 
     * Usado cuando el usuario olvida su contraseña.
     * 
     * @param {string} correo - Email del usuario
     * @param {string} token - Token de recuperación
     * @param {Date} expiresAt - Fecha de expiración (usualmente 1 hora)
     * @returns {Promise<boolean>} - true si se guardó correctamente
     */
    const saveResetToken = async (correo, token, expiresAt) => {
    try {
        const [result] = await pool.query(
        `UPDATE usuarios 
        SET reset_token = ?, reset_token_expires = ? 
        WHERE Correo = ?`,
        [token, expiresAt, correo]
        );
        
        return result.affectedRows > 0;
        
    } catch (error) {
        throw new Error(`Error al guardar token de recuperación: ${error.message}`);
    }
    };

    /**
     * 🔍 BUSCAR POR TOKEN DE RECUPERACIÓN
     * 
     * Verifica que el token existe y no ha expirado.
     * 
     * @param {string} token - Token de recuperación
     * @returns {Promise<Object|null>} - Usuario si el token es válido, null si no
     */
    const findByResetToken = async (token) => {
    try {
        const [rows] = await pool.query(
        `SELECT * FROM usuarios 
        WHERE reset_token = ? 
        AND reset_token_expires > NOW()
        AND estado = "activo"`,
        [token]
        );
        
        if (rows.length === 0) return null;
        
        return mapDbToApp(rows[0]);
        
    } catch (error) {
        throw new Error(`Error al buscar por token: ${error.message}`);
    }
    };

    /**
     * 🔄 ACTUALIZAR CONTRASEÑA
     * 
     * Actualiza la contraseña y limpia los tokens de recuperación.
     * 
     * @param {number} id - ID del usuario
     * @param {string} newPasswordHash - Nueva contraseña hasheada
     * @returns {Promise<void>}
     */
    const updatePassword = async (id, newPasswordHash) => {
    try {
        await pool.query(
        `UPDATE usuarios 
        SET password_hash = ?, 
            reset_token = NULL, 
            reset_token_expires = NULL 
        WHERE Id_Usuario = ?`,
        [newPasswordHash, id]
        );
    } catch (error) {
        throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
    };

    /**
     * 🗑️ ELIMINAR USUARIO (SOFT DELETE)
     * 
     * No elimina realmente, solo cambia el estado a 'inactivo'.
     * 
     * @param {number} id - ID del usuario
     * @returns {Promise<boolean>} - true si se desactivó correctamente
     */
    const softDelete = async (id) => {
    try {
        const [result] = await pool.query(
        'UPDATE usuarios SET estado = "inactivo" WHERE Id_Usuario = ?',
        [id]
        );
        
        return result.affectedRows > 0;
        
    } catch (error) {
        throw new Error(`Error al desactivar usuario: ${error.message}`);
    }
    };

    /**
     * 📊 OBTENER ROL DEL USUARIO
     * 
     * Consulta la tabla de roles para obtener el nombre del rol.
     * 
     * @param {number} rolId - ID del rol
     * @returns {Promise<string>} - Nombre del rol ('admin', 'trabajador', 'cliente')
     */
    const getRoleName = async (rolId) => {
    try {
        const [rows] = await pool.query(
        'SELECT Rol FROM Rol WHERE Id_Rol = ?',
        [rolId]
        );
        
        if (rows.length === 0) return 'cliente'; // Default
        
        // Convertir a minúsculas para consistencia
        return rows[0].rol.toLowerCase();
        
    } catch (error) {
        console.error('Error al obtener nombre de rol:', error.message);
        return 'cliente'; // Default en caso de error
    }
    };

    // Exportar todas las funciones
    module.exports = {
    findByEmail,
    findById,
    create,
    update,
    updateLastLogin,
    saveResetToken,
    findByResetToken,
    updatePassword,
    softDelete,
    getRoleName
    };