// =============================================================================
// AUTHUTILS.JS - SISTEMA DE AUTENTICACIÓN CON TOKENS Y LOCALSTORAGE
// =============================================================================
// Este archivo maneja toda la lógica de autenticación de usuarios.
// Usa localStorage para persistir datos incluso cuando cierras el navegador.
// =============================================================================

// -----------------------------------------------------------------------------
// 1. BASE DE DATOS SIMULADA DE USUARIOS
// -----------------------------------------------------------------------------
// En una aplicación real, estos usuarios estarían en un servidor/base de datos.
// Aquí los simulamos en un objeto JavaScript para propósitos de aprendizaje.

export const USERS_DB = {
    "admin@gmail.com": {
        password: "123456",           // Contraseña (en producción debe estar encriptada)
        role: "admin",                // Rol del usuario (permisos)
        token: "token-admin-12345",   // Token único de identificación
        redirect: "./reportes.jsx"   // Página a la que redirige después del login
    },
    "trabajador@gmail.com": {
        password: "123456",
        role: "trabajador",
        token: "token-trabajador-67890",
        redirect: "./tareas.jsx"
    },
    "cliente@gmail.com": {
        password: "123456",
        role: "cliente",
        token: "token-cliente-abcde",
        redirect: "./servicios_cliente.jsx"
    }
};

// -----------------------------------------------------------------------------
// 2. FUNCIÓN DE INICIO DE SESIÓN (LOGIN)
// -----------------------------------------------------------------------------
/**
 * Simula el proceso de inicio de sesión verificando credenciales.
 * 
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {object} Objeto con el resultado del login (success, message, datos del usuario)
 */
export function simulateLogin(email, password) {
    // Buscar al usuario en la base de datos simulada
    const user = USERS_DB[email];

    // VALIDACIÓN 1: ¿Existe el usuario con ese email?
    if (!user) {
        return { 
            success: false, 
            message: "Correo o contraseña incorrectos." 
        };
    }

    // VALIDACIÓN 2: ¿La contraseña coincide?
    if (user.password !== password) {
        return { 
            success: false, 
            message: "Correo o contraseña incorrectos." 
        };
    }

    // ✅ LOGIN EXITOSO: Devolver los datos del usuario
    return {
        success: true,
        message: `¡Bienvenido, ${user.role}! Redireccionando...`,
        role: user.role,
        token: user.token,
        redirect: user.redirect,
        email: email
    };
}

// -----------------------------------------------------------------------------
// 3. GESTIÓN DE SESIONES ACTIVAS EN LOCALSTORAGE
// -----------------------------------------------------------------------------
// localStorage es una API del navegador que guarda datos permanentemente.
// Los datos persisten incluso si cierras el navegador o apagas la computadora.
// Solo se borran si los eliminas manualmente o limpias el caché del navegador.

/**
 * Registra una nueva sesión activa en localStorage.
 * Esto permite que el usuario permanezca "logueado" incluso después de cerrar el navegador.
 * 
 * @param {string} email - Email del usuario
 * @param {string} role - Rol del usuario
 * @param {string} token - Token de autenticación
 * @param {string} redirect - URL de redirección
 */
export function registrarSesionActiva(email, role, token, redirect) {
    // Crear objeto con los datos de la sesión
    const sesion = {
        id: `SESSION-${Date.now()}`,              // ID único basado en timestamp
        email: email,
        role: role,
        token: token,
        redirect: redirect,
        fechaInicio: new Date().toISOString(),    // Fecha/hora de inicio
        ultimaActividad: new Date().toISOString() // Última vez que el usuario hizo algo
    };
    
    // PASO 1: Obtener sesiones activas existentes de localStorage
    // localStorage.getItem() devuelve un STRING (o null si no existe)
    // JSON.parse() convierte ese string en un array/objeto de JavaScript
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    
    // PASO 2: Verificar si ya existe una sesión para este usuario
    const sesionExistente = sesionesActivas.findIndex(s => s.email === email);
    
    if (sesionExistente !== -1) {
        // Si existe, actualizarla (evita duplicados)
        sesionesActivas[sesionExistente] = sesion;
        console.log('🔄 Sesión existente actualizada:', sesion.id);
    } else {
        // Si no existe, agregar nueva sesión
        sesionesActivas.push(sesion);
        console.log('✅ Nueva sesión registrada:', sesion.id);
    }
    
    // PASO 3: Guardar de vuelta en localStorage
    // localStorage.setItem() requiere un STRING, por eso usamos JSON.stringify()
    // JSON.stringify() convierte un array/objeto de JavaScript en un string JSON
    localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
    
    // PASO 4: Guardar también los datos de la sesión actual en sessionStorage
    // sessionStorage es temporal: se borra cuando cierras la pestaña del navegador
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userRedirect', redirect);
    
    return sesion;
}

/**
 * Actualiza la última actividad de una sesión (para evitar que expire).
 * Llama a esta función cada vez que el usuario interactúa con la app.
 * 
 * @param {string} token - Token de la sesión a actualizar
 */
export function actualizarActividadSesion(token) {
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    
    // Buscar la sesión por token
    const sesion = sesionesActivas.find(s => s.token === token);
    
    if (sesion) {
        // Actualizar el timestamp de última actividad
        sesion.ultimaActividad = new Date().toISOString();
        localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
    }
}

/**
 * Elimina una sesión activa del registro.
 * Se usa cuando el usuario cierra sesión (logout).
 * 
 * @param {string} token - Token de la sesión a eliminar
 */
export function eliminarSesionActiva(token) {
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    
    // Buscar la sesión que vamos a eliminar (para el log)
    const sesionEliminada = sesionesActivas.find(s => s.token === token);
    
    // Filtrar: mantener solo las sesiones que NO tengan ese token
    sesionesActivas = sesionesActivas.filter(s => s.token !== token);
    localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
    
    if (sesionEliminada) {
        console.log('❌ Sesión eliminada:', sesionEliminada.id);
    }
}

/**
 * Limpia sesiones expiradas (más de 2 horas sin actividad).
 * Es buena práctica llamar a esta función al iniciar la aplicación.
 */
export function limpiarSesionesExpiradas() {
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    const ahora = new Date().getTime(); // Timestamp actual en milisegundos
    const dosHoras = 2 * 60 * 60 * 1000; // 2 horas convertidas a milisegundos
    
    const sesionesOriginales = sesionesActivas.length;
    
    // Filtrar: mantener solo sesiones con actividad reciente
    sesionesActivas = sesionesActivas.filter(sesion => {
        const ultimaActividad = new Date(sesion.ultimaActividad).getTime();
        return (ahora - ultimaActividad) < dosHoras; // ¿Activo en las últimas 2 horas?
    });
    
    const sesionesEliminadas = sesionesOriginales - sesionesActivas.length;
    if (sesionesEliminadas > 0) {
        console.log(`🧹 ${sesionesEliminadas} sesiones expiradas eliminadas`);
    }
    
    localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
}

// -----------------------------------------------------------------------------
// 4. VERIFICACIÓN DE SESIÓN ACTIVA
// -----------------------------------------------------------------------------
/**
 * Verifica si hay una sesión activa en sessionStorage.
 * Esta función se usa en páginas protegidas para verificar que el usuario esté logueado.
 * 
 * @returns {object} Objeto con información de la sesión (isActive, token, role, email)
 */
export function checkActiveSession() {
    // Obtener datos de sessionStorage
    const token = sessionStorage.getItem('authToken');
    const role = sessionStorage.getItem('userRole');
    const email = sessionStorage.getItem('userEmail');
    
    // Si falta algún dato, no hay sesión activa
    if (!token || !role) {
        return { isActive: false };
    }
    
    // Actualizar actividad de la sesión
    actualizarActividadSesion(token);
    
    return {
        isActive: true,
        token: token,
        role: role,
        email: email
    };
}

/**
 * Protege una página verificando que el usuario esté logueado y tenga el rol correcto.
 * Esta función se debe llamar al cargar una página protegida.
 * 
 * @param {Array} allowedRoles - Array de roles permitidos (ej: ['admin', 'trabajador'])
 * @returns {object|boolean} Datos de la sesión si tiene acceso, false si no
 */
export function protectPage(allowedRoles = []) {
    const session = checkActiveSession();
    
    // VALIDACIÓN 1: ¿Hay sesión activa?
    if (!session.isActive) {
        alert('Debes iniciar sesión para acceder a esta página.');
        // window.location.href = './index.html'; // Descomentar en producción
        return false;
    }
    
    // VALIDACIÓN 2: ¿El usuario tiene el rol correcto?
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
        alert('No tienes permisos para acceder a esta página.');
        // window.location.href = './index.html'; // Descomentar en producción
        return false;
    }
    
    console.log('✅ Acceso autorizado:', session.role, '-', session.email);
    return session;
}

// -----------------------------------------------------------------------------
// 5. CERRAR SESIÓN (LOGOUT)
// -----------------------------------------------------------------------------
/**
 * Cierra la sesión del usuario eliminando todos los datos de autenticación.
 * Limpia tanto sessionStorage como el registro en localStorage.
 */
export function logout() {
    const token = sessionStorage.getItem('authToken');
    const email = sessionStorage.getItem('userEmail');
    
    // Eliminar sesión activa del registro
    if (token) {
        eliminarSesionActiva(token);
    }
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRedirect');
    
    console.log('👋 Sesión cerrada:', email);
    
    // Redirigir a la página principal
    // window.location.href = './index.html'; // Descomentar en producción
}

// -----------------------------------------------------------------------------
// 6. FUNCIÓN DE REGISTRO (NUEVA CUENTA)
// -----------------------------------------------------------------------------
/**
 * Registra un nuevo usuario en la base de datos simulada.
 * En producción, esto enviaría los datos a un servidor.
 * 
 * @param {string} email - Email del nuevo usuario
 * @param {string} password - Contraseña del nuevo usuario
 * @param {object} additionalData - Datos adicionales (nombre, teléfono, etc.)
 * @returns {object} Resultado del registro
 */
export function registerUser(email, password, additionalData = {}) {
    // VALIDACIÓN 1: ¿El email ya existe?
    if (USERS_DB[email]) {
        return {
            success: false,
            message: "El correo electrónico ya está registrado."
        };
    }
    
    // VALIDACIÓN 2: ¿La contraseña es suficientemente larga?
    if (password.length < 6) {
        return {
            success: false,
            message: "La contraseña debe tener al menos 6 caracteres."
        };
    }
    
    // Crear token único para el nuevo usuario
    const newToken = `token-new-client-${Date.now()}`;
    
    // Crear objeto del nuevo usuario
    const newUser = {
        password: password,
        role: "cliente", // Nuevos usuarios siempre son clientes
        token: newToken,
        redirect: "./servicios_cliente.html",
        ...additionalData // Spread operator: agrega los datos adicionales
    };
    
    // Agregar a la base de datos (solo en memoria, no persiste al recargar)
    USERS_DB[email] = newUser;
    
    return {
        success: true,
        message: "Registro exitoso. ¡Sesión iniciada!",
        role: newUser.role,
        token: newUser.token,
        redirect: newUser.redirect,
        email: email
    };
}

// =============================================================================
// INICIALIZACIÓN: Limpiar sesiones expiradas al importar este módulo
// =============================================================================
limpiarSesionesExpiradas();

console.log('🔐 Sistema de autenticación inicializado');