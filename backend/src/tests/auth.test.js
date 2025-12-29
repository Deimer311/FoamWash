    /**
     * 🧪 SCRIPT DE PRUEBAS AUTOMATIZADO - SISTEMA DE AUTENTICACIÓN
     * 
     * Este script prueba todos los endpoints del sistema de autenticación
     * Ejecutar: node tests/auth.test.js
     * 
     * ⚠️ IMPORTANTE: El servidor debe estar corriendo antes de ejecutar este script3
     */

    // ============================================================================
    // IMPORTACIÓN DE DEPENDENCIAS
    // ============================================================================

    // Carga las variables de entorno desde el archivo .env
    require('dotenv').config();

    // Biblioteca para hacer peticiones HTTP a la API
    const axios = require('axios');

    // ============================================================================
    // CONFIGURACIÓN INICIAL
    // ============================================================================

    // URL base de la API - usa la del .env o localhost:3000 por defecto
    const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

    // Variables globales para almacenar tokens durante las pruebas
    let accessToken = '';      // Token de acceso (JWT corta duración)
    let refreshToken = '';     // Token de refresco (JWT larga duración)
    let resetToken = '';       // Token temporal para reseteo de contraseña

    // ============================================================================
    // UTILIDADES PARA CONSOLA CON COLORES
    // ============================================================================

    // Códigos ANSI para colorear la salida en la terminal
    const colors = {
    reset: '\x1b[0m',      // Restaura el color por defecto
    green: '\x1b[32m',     // Verde para éxitos
    red: '\x1b[31m',       // Rojo para errores
    yellow: '\x1b[33m',    // Amarillo para advertencias
    blue: '\x1b[34m',      // Azul para información
    cyan: '\x1b[36m'       // Cyan para títulos de sección
    };

    // Objeto con funciones helper para imprimir mensajes formateados
    const log = {
    // Mensaje de éxito en verde con checkmark
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    
    // Mensaje de error en rojo con X
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    
    // Mensaje informativo en azul con ícono
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    
    // Mensaje de advertencia en amarillo con ícono
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    
    // Título de sección con líneas divisorias
    section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
    };

    // ============================================================================
    // DATOS DE PRUEBA
    // ============================================================================

    // Usuario de prueba tipo "cliente" (rol por defecto)
    const testUser = {
    nombre: 'Usuario Test',                           // Nombre completo
    correo: `test${Date.now()}@ejemplo.com`,         // Email único usando timestamp
    password: 'password123',                          // Contraseña inicial
    telefono: '3001234567',                          // Número de teléfono
    nDocumento: `${Date.now()}`,                     // Documento único usando timestamp
    direccion: 'Calle de Prueba 123',                // Dirección física
    tipoDocumentoId: 1                               // ID del tipo de documento (ej: CC)
    };

    // Usuario de prueba tipo "administrador"
    const testAdmin = {
    nombre: 'Admin Test',
    correo: `admin${Date.now()}@foamwash.com`,      // Email único en dominio de la empresa
    password: 'admin123',
    telefono: '3009876543',
    nDocumento: `${Date.now() + 1}`,                // +1 para evitar duplicado con testUser
    direccion: 'Oficina Principal',
    tipoDocumentoId: 1,
    role: 'admin'                                    // Especifica rol de administrador
    };

    // ============================================================================
    // FUNCIONES DE PRUEBA
    // ============================================================================

    /**
     * TEST 1: HEALTH CHECK
     * Verifica que el servidor esté corriendo y responda correctamente
     */
    async function testHealthCheck() {
    log.section('TEST 1: Health Check');
    
    try {
        // Hace petición GET al endpoint de salud
        const response = await axios.get(`${BASE_URL}/health`);
        
        // Verifica código 200 y flag de éxito
        if (response.status === 200 && response.data.success) {
        log.success('Health check exitoso');
        log.info(`Mensaje: ${response.data.message}`);
        return true;  // Prueba exitosa
        } else {
        log.error('Health check falló');
        return false;  // Prueba fallida
        }
    } catch (error) {
        // Si hay error, muestra el mensaje y verifica si el servidor está corriendo
        log.error(`Error: ${error.message}`);
        log.warn('¿Está el servidor corriendo en el puerto 3000?');
        return false;
    }
    }

    /**
     * TEST 2: REGISTRO DE USUARIO CLIENTE
     * Prueba el registro de un nuevo usuario con rol "cliente"
     */
    async function testRegisterCliente() {
    log.section('TEST 2: Registrar Usuario Cliente');
    
    try {
        // Envía petición POST con los datos del usuario de prueba
        const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
        
        // Verifica código 201 (creado) y flag de éxito
        if (response.status === 201 && response.data.success) {
        log.success('Usuario cliente registrado exitosamente');
        log.info(`ID: ${response.data.data.user.id}`);
        log.info(`Email: ${response.data.data.user.correo}`);
        log.info(`Role: ${response.data.data.user.role}`);
        
        // Guarda los tokens JWT recibidos para usarlos en pruebas posteriores
        accessToken = response.data.data.accessToken;
        refreshToken = response.data.data.refreshToken;
        
        log.info('Tokens guardados para pruebas posteriores');
        return true;
        } else {
        log.error('Registro falló');
        return false;
        }
    } catch (error) {
        // Muestra el mensaje de error del servidor o el error genérico
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 3: REGISTRO DE USUARIO ADMINISTRADOR
     * Prueba el registro de un usuario con rol "admin"
     */
    async function testRegisterAdmin() {
    log.section('TEST 3: Registrar Usuario Admin');
    
    try {
        // Envía petición POST con los datos del admin de prueba
        const response = await axios.post(`${BASE_URL}/auth/register`, testAdmin);
        
        if (response.status === 201 && response.data.success) {
        log.success('Usuario admin registrado exitosamente');
        log.info(`Role: ${response.data.data.user.role}`);
        return true;
        } else {
        log.error('Registro de admin falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 4: LOGIN CON EMAIL INEXISTENTE
     * Verifica que el sistema rechace intentos de login con email no registrado
     * Esta prueba DEBE fallar para ser exitosa (prueba negativa)
     */
    async function testLoginInvalid() {
    log.section('TEST 4: Login con Email Inexistente (debe fallar)');
    
    try {
        // Intenta login con credenciales que no existen
        await axios.post(`${BASE_URL}/auth/login`, {
        correo: 'noexiste@ejemplo.com',
        password: 'cualquiera'
        });
        
        // Si llegamos aquí, la prueba falló (no debería permitir el login)
        log.error('Login debería haber fallado pero no lo hizo');
        return false;
    } catch (error) {
        // Verificamos que el error sea 401 (No autorizado)
        if (error.response?.status === 401) {
        log.success('Login falló correctamente (401)');
        log.info(`Mensaje: ${error.response.data.error.message}`);
        return true;  // Prueba exitosa porque falló como esperábamos
        } else {
        log.error(`Error inesperado: ${error.message}`);
        return false;
        }
    }
    }

    /**
     * TEST 5: LOGIN CON CONTRASEÑA INCORRECTA
     * Verifica que el sistema rechace login con contraseña equivocada
     * Esta prueba DEBE fallar para ser exitosa (prueba negativa)
     */
    async function testLoginWrongPassword() {
    log.section('TEST 5: Login con Contraseña Incorrecta (debe fallar)');
    
    try {
        // Intenta login con email correcto pero contraseña incorrecta
        await axios.post(`${BASE_URL}/auth/login`, {
        correo: testUser.correo,           // Email que sí existe
        password: 'contraseñaIncorrecta'   // Contraseña errónea
        });
        
        log.error('Login debería haber fallado pero no lo hizo');
        return false;
    } catch (error) {
        // Verificamos que devuelva 401 (credenciales inválidas)
        if (error.response?.status === 401) {
        log.success('Login falló correctamente (401)');
        return true;
        } else {
        log.error(`Error inesperado: ${error.message}`);
        return false;
        }
    }
    }

    /**
     * TEST 6: LOGIN EXITOSO
     * Prueba el login con credenciales correctas
     */
    async function testLoginSuccess() {
    log.section('TEST 6: Login Exitoso');
    
    try {
        // Intenta login con credenciales válidas
        const response = await axios.post(`${BASE_URL}/auth/login`, {
        correo: testUser.correo,
        password: testUser.password
        });
        
        // Verifica código 200 y flag de éxito
        if (response.status === 200 && response.data.success) {
        log.success('Login exitoso');
        log.info(`Usuario: ${response.data.data.user.nombre}`);
        log.info(`Email: ${response.data.data.user.correo}`);
        
        // Actualiza los tokens con los nuevos recibidos
        accessToken = response.data.data.accessToken;
        refreshToken = response.data.data.refreshToken;
        
        log.info('Tokens actualizados');
        return true;
        } else {
        log.error('Login falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 7: OBTENER PERFIL DEL USUARIO
     * Prueba el endpoint protegido que devuelve información del usuario autenticado
     */
    async function testGetProfile() {
    log.section('TEST 7: Obtener Mi Perfil');
    
    try {
        // Hace petición GET incluyendo el token JWT en el header Authorization
        const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`  // Formato estándar Bearer Token
        }
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Perfil obtenido exitosamente');
        log.info(`Nombre: ${response.data.data.nombre}`);
        log.info(`Email: ${response.data.data.correo}`);
        log.info(`Role: ${response.data.data.role}`);
        return true;
        } else {
        log.error('No se pudo obtener el perfil');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 8: ACCESO SIN TOKEN DE AUTENTICACIÓN
     * Verifica que los endpoints protegidos rechacen peticiones sin token
     * Esta prueba DEBE fallar para ser exitosa (prueba negativa)
     */
    async function testUnauthorizedAccess() {
    log.section('TEST 8: Acceso Sin Token (debe fallar)');
    
    try {
        // Intenta acceder al endpoint protegido SIN incluir el token
        await axios.get(`${BASE_URL}/auth/me`);
        
        log.error('Debería haber bloqueado el acceso pero no lo hizo');
        return false;
    } catch (error) {
        // Verifica que devuelva 401 (No autorizado)
        if (error.response?.status === 401) {
        log.success('Acceso bloqueado correctamente (401)');
        return true;
        } else {
        log.error(`Error inesperado: ${error.message}`);
        return false;
        }
    }
    }

    /**
     * TEST 9: FORGOT PASSWORD (OLVIDÉ MI CONTRASEÑA)
     * Prueba el proceso de solicitud de recuperación de contraseña
     */
    async function testForgotPassword() {
    log.section('TEST 9: Solicitar Recuperación de Contraseña');
    
    try {
        // Envía petición con el email del usuario que olvidó su contraseña
        const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        correo: testUser.correo
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Solicitud de recuperación exitosa');
        
        // En desarrollo, el token se retorna en la respuesta para facilitar pruebas
        // En producción, este token se enviaría por email al usuario
        if (response.data.data?.token) {
            resetToken = response.data.data.token;
            log.info(`Token de recuperación: ${resetToken}`);
            log.warn('NOTA: En producción, este token se envía por email');
        }
        
        return true;
        } else {
        log.error('Solicitud falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 10: RESET PASSWORD (RESETEAR CONTRASEÑA)
     * Prueba el proceso de establecer una nueva contraseña usando el token de recuperación
     */
    async function testResetPassword() {
    log.section('TEST 10: Resetear Contraseña con Token');
    
    // Verifica que tengamos un token de recuperación de la prueba anterior
    if (!resetToken) {
        log.warn('No hay token de recuperación, saltando esta prueba');
        return true;
    }
    
    try {
        const newPassword = 'newpassword123';  // Nueva contraseña para el usuario
        
        // Envía petición con el token y la nueva contraseña
        const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: resetToken,              // Token recibido por email (o en la prueba anterior)
        newPassword: newPassword,       // Nueva contraseña
        confirmPassword: newPassword    // Confirmación de la nueva contraseña
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Contraseña reseteada exitosamente');
        
        // Actualiza la contraseña en nuestro objeto de prueba
        // para que las siguientes pruebas usen la nueva contraseña
        testUser.password = newPassword;
        
        return true;
        } else {
        log.error('Reset de contraseña falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 11: LOGIN CON NUEVA CONTRASEÑA
     * Verifica que el usuario pueda hacer login con la contraseña recién cambiada
     */
    async function testLoginNewPassword() {
    log.section('TEST 11: Login con Nueva Contraseña');
    
    try {
        // Intenta login con la nueva contraseña establecida en el test anterior
        const response = await axios.post(`${BASE_URL}/auth/login`, {
        correo: testUser.correo,
        password: testUser.password  // Esta ahora es 'newpassword123'
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Login con nueva contraseña exitoso');
        
        // Actualiza los tokens con los nuevos recibidos
        accessToken = response.data.data.accessToken;
        refreshToken = response.data.data.refreshToken;
        
        return true;
        } else {
        log.error('Login falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 12: REFRESH TOKEN (RENOVAR TOKEN)
     * Prueba el proceso de obtener un nuevo access token usando el refresh token
     * Esto es útil cuando el access token expira pero no queremos que el usuario vuelva a hacer login
     */
    async function testRefreshToken() {
    log.section('TEST 12: Refresh Token');
    
    try {
        // Envía el refresh token para obtener nuevos tokens
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken  // Token de larga duración guardado en login
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Tokens refrescados exitosamente');
        
        // Actualiza ambos tokens con los nuevos recibidos
        accessToken = response.data.data.accessToken;
        refreshToken = response.data.data.refreshToken;
        
        log.info('Nuevos tokens obtenidos');
        return true;
        } else {
        log.error('Refresh token falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 13: CHANGE PASSWORD (CAMBIAR CONTRASEÑA)
     * Prueba el cambio de contraseña para un usuario autenticado
     * A diferencia del reset, aquí el usuario DEBE conocer su contraseña actual
     */
    async function testChangePassword() {
    log.section('TEST 13: Cambiar Contraseña (Usuario Autenticado)');
    
    try {
        const newPassword = 'changedpassword123';  // Nueva contraseña deseada
        
        // Envía petición con contraseña actual y nueva contraseña
        const response = await axios.post(`${BASE_URL}/auth/change-password`, {
        currentPassword: testUser.password,   // Contraseña actual (requerida)
        newPassword: newPassword,             // Nueva contraseña
        confirmPassword: newPassword          // Confirmación de nueva contraseña
        }, {
        headers: {
            Authorization: `Bearer ${accessToken}`  // Requiere estar autenticado
        }
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Contraseña cambiada exitosamente');
        
        // Actualiza la contraseña en nuestro objeto de prueba
        testUser.password = newPassword;
        
        return true;
        } else {
        log.error('Cambio de contraseña falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 14: LOGOUT (CERRAR SESIÓN)
     * Prueba el cierre de sesión del usuario
     */
    async function testLogout() {
    log.section('TEST 14: Logout');
    
    try {
        // Envía petición de logout con el token de autenticación
        const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
        });
        
        if (response.status === 200 && response.data.success) {
        log.success('Logout exitoso');
        return true;
        } else {
        log.error('Logout falló');
        return false;
        }
    } catch (error) {
        log.error(`Error: ${error.response?.data?.error?.message || error.message}`);
        return false;
    }
    }

    /**
     * TEST 15: VALIDACIÓN DE DATOS INVÁLIDOS
     * Verifica que el servidor valide correctamente los datos de entrada
     * y rechace datos con formato incorrecto
     * Esta prueba DEBE fallar para ser exitosa (prueba negativa)
     */
    async function testValidationErrors() {
    log.section('TEST 15: Validación de Datos Inválidos');
    
    try {
        // Intenta registrar con datos que NO cumplen las validaciones
        await axios.post(`${BASE_URL}/auth/register`, {
        nombre: 'Test',
        correo: 'emailinvalido',        // Email sin formato correcto (@dominio.com)
        password: '123',                 // Contraseña muy corta (min 6 caracteres)
        telefono: '123',                 // Teléfono inválido (formato colombiano esperado)
        nDocumento: '123',
        direccion: 'Dir',
        tipoDocumentoId: 1
        });
        
        // Si llegamos aquí, la validación no funcionó
        log.error('Validación debería haber fallado pero no lo hizo');
        return false;
    } catch (error) {
        // Verificamos que el error sea 400 (Bad Request - datos inválidos)
        if (error.response?.status === 400) {
        log.success('Validación funcionó correctamente (400)');
        log.info('Errores detectados:');
        
        // Muestra cada error de validación detectado
        error.response.data.error.details?.forEach((err, index) => {
            log.info(`  ${index + 1}. ${err.field}: ${err.message}`);
        });
        
        return true;  // Prueba exitosa porque la validación funcionó
        } else {
        log.error(`Error inesperado: ${error.message}`);
        return false;
        }
    }
    }

    // ============================================================================
    // EJECUTOR PRINCIPAL DE PRUEBAS
    // ============================================================================

    /**
     * Función principal que ejecuta todas las pruebas secuencialmente
     * y muestra un resumen final de resultados
     */
    async function runAllTests() {
    // Banner inicial
    console.log(`
    ${colors.cyan}╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║          🧪 SUITE DE PRUEBAS - AUTENTICACIÓN              ║
    ║               FoamWash Backend API                        ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝${colors.reset}
    `);
    
    // Array con todas las pruebas a ejecutar
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Registrar Cliente', fn: testRegisterCliente },
        { name: 'Registrar Admin', fn: testRegisterAdmin },
        { name: 'Login Inválido', fn: testLoginInvalid },
        { name: 'Contraseña Incorrecta', fn: testLoginWrongPassword },
        { name: 'Login Exitoso', fn: testLoginSuccess },
        { name: 'Obtener Perfil', fn: testGetProfile },
        { name: 'Acceso No Autorizado', fn: testUnauthorizedAccess },
        { name: 'Forgot Password', fn: testForgotPassword },
        { name: 'Reset Password', fn: testResetPassword },
        { name: 'Login Nueva Contraseña', fn: testLoginNewPassword },
        { name: 'Refresh Token', fn: testRefreshToken },
        { name: 'Change Password', fn: testChangePassword },
        { name: 'Logout', fn: testLogout },
        { name: 'Validación de Datos', fn: testValidationErrors }
    ];
    
    // Contadores de resultados
    let passed = 0;   // Pruebas exitosas
    let failed = 0;   // Pruebas fallidas
    
    // Ejecuta cada prueba secuencialmente
    for (const test of tests) {
        const result = await test.fn();  // Ejecuta la función de prueba
        
        // Incrementa el contador correspondiente
        if (result) {
        passed++;
        } else {
        failed++;
        }
        
        // Pequeña pausa entre pruebas para legibilidad en la consola
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // ============================================================================
    // RESUMEN FINAL
    // ============================================================================
    
    console.log(`
    ${colors.cyan}╔════════════════════════════════════════════════════════════╗
    ║                     RESUMEN DE PRUEBAS                     ║
    ╚════════════════════════════════════════════════════════════╝${colors.reset}
    `);
    
    // Muestra estadísticas
    log.success(`Pruebas exitosas: ${passed}`);
    log.error(`Pruebas fallidas: ${failed}`);
    
    // Calcula y muestra el porcentaje de éxito
    const percentage = ((passed / tests.length) * 100).toFixed(1);
    console.log(`\n${colors.blue}Porcentaje de éxito: ${percentage}%${colors.reset}\n`);
    
    // Mensaje final según el resultado
    if (failed === 0) {
        console.log(`${colors.green}🎉 ¡TODAS LAS PRUEBAS PASARON!${colors.reset}\n`);
    } else {
        console.log(`${colors.red}⚠️  Algunas pruebas fallaron. Revisa los logs arriba.${colors.reset}\n`);
    }
    }

    // ============================================================================
    // EJECUCIÓN DEL SCRIPT
    // ============================================================================

    // Ejecuta todas las pruebas cuando se corre el script
    runAllTests();