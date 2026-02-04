/**=============================================================================
 * CONFIGURACION DE LA BASE DE DATOS
 * Configuracion del pool de conexiones a MYSQL
 * Usa mysql2/promise para trabajar con async/await
 * ----------------------------------------------------------------------------
 * creado el dia 10 de Diciembre del 2025
 * =============================================================================
 */
const { parse } = require('dotenv');
const mysql = require('mysql2/promise');

/**
 * -----------------------------------------------------------------------------
 * CREAR POOL DE CONEXIONES
 * El pool mantiene multiples conexxiones abiertas y las reutiliza
 * lo cual es mas eficiente que crar una conexion por cada query.
 * -----------------------------------------------------------------------------
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost ',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'foam_wash_db',

    //configuracion de pool
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,

    //CONFIGURACION DEÑ TIMEZONE
    timezone: 'z', // UTC

    //configuracion de charset
    charset: 'utf8mb4',

    //configuracion de reconexiones
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

/**
 * 🔍 PROBAR CONEXIÓN
 * 
 * Verifica que la conexión a la BD funcione correctamente.
 */
    const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        
        // Verificar que la tabla usuario existe
        const [tables] = await connection.query(
        "SHOW TABLES LIKE 'usuario'"
        );
        
        if (tables.length > 0) {
        console.log('✅ Tabla usuario encontrada');
        } else {
        console.warn('⚠️ Tabla usuario NO encontrada');
        }
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a MySQL:', error.message);
        return false;
    }
    };

    /**
     * 📊 MAPEO DE CAMPOS DE BD A FORMATO DE APLICACIÓN
     * 
     * Tu BD usa nombres como "Id_Usuario", "N_Documento", etc.
     * La aplicación usa camelCase: "idUsuario", "nDocumento", etc.
     * 
     * Esta función convierte de BD a App.
     */
    const mapDbToApp = (dbRow) => {
    if (!dbRow) return null;
    
    return {
        id: dbRow.Id_Usuario,
        nombre: dbRow.Nombre,
        telefono: dbRow.Telefono,
        nDocumento: dbRow.N_Documento,
        direccion: dbRow.Direccion,
        correo: dbRow.Correo,
        passwordHash: dbRow.password_hash,
        rolId: dbRow.rol_Id_Rol,
        tipoDocumentoId: dbRow.Tipo_de_Documento_idTipo_de_Documento,
        fechaRegistro: dbRow.fecha_registro,
        lastLogin: dbRow.last_login,
        resetToken: dbRow.reset_token,
        resetTokenExpires: dbRow.reset_token_expires,
        estado: dbRow.estado
    };
    };

    /**
     * 🔄 MAPEO DE FORMATO DE APLICACIÓN A BD
     * 
     * Convierte de camelCase a nombres de columnas de tu BD.
     */
    const mapAppToDb = (appData) => {
    const dbData = {};
    
    if (appData.nombre !== undefined) dbData.Nombre = appData.nombre;
    if (appData.telefono !== undefined) dbData.Telefono = appData.telefono;
    if (appData.nDocumento !== undefined) dbData.N_Documento = appData.nDocumento;
    if (appData.direccion !== undefined) dbData.Direccion = appData.direccion;
    if (appData.correo !== undefined) dbData.Correo = appData.correo;
    if (appData.passwordHash !== undefined) dbData.password_hash = appData.passwordHash;
    if (appData.rolId !== undefined) dbData.rol_Id_Rol = appData.rolId;
    if (appData.tipoDocumentoId !== undefined) dbData.Tipo_de_Documento_idTipo_de_Documento = appData.tipoDocumentoId;
    if (appData.lastLogin !== undefined) dbData.last_login = appData.lastLogin;
    if (appData.resetToken !== undefined) dbData.reset_token = appData.resetToken;
    if (appData.resetTokenExpires !== undefined) dbData.reset_token_expires = appData.resetTokenExpires;
    if (appData.estado !== undefined) dbData.estado = appData.estado;
    
    return dbData;
    };

    /**
     * 🔐 EXCLUIR CAMPOS SENSIBLES
     * 
     * Nunca retornar contraseñas o tokens sensibles al cliente.
     */
    const excludeSensitiveFields = (user) => {
    if (!user) return null;
    
    const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = user;
    return safeUser;
    };

    module.exports = {
    pool,
    testConnection,
    mapDbToApp,
    mapAppToDb,
    excludeSensitiveFields
    };