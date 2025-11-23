// =============================================================================
// AUTHCONTEXT.JSX - SISTEMA DE AUTENTICACIÓN CON REDIRECCIÓN AUTOMÁTICA
// =============================================================================
// MEJORAS:
// 1. ✅ Persistencia con localStorage
// 2. ✅ Redirección automática después del login
// 3. ✅ Restauración de sesión al recargar la página
// 4. ✅ Gestión de usuarios registrados persistente
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

// -----------------------------------------------------------------------------
// 1. CREAR EL CONTEXTO
// -----------------------------------------------------------------------------
const AuthContext = createContext();

// -----------------------------------------------------------------------------
// 2. BASE DE DATOS SIMULADA INICIAL
// -----------------------------------------------------------------------------
/**
 * USUARIOS POR DEFECTO
 * Estos usuarios estarán disponibles siempre
 */
const DEFAULT_USERS = {
    "admin@gmail.com": { 
        password: "123456", 
        role: "admin", 
        name: "Administrador FoamWash",
        token: "admin-token-xyz",
        redirectPage: "reportes"  // ← Página a la que debe ir después del login
    },
    "trabajador@gmail.com": { 
        password: "123456", 
        role: "trabajador", 
        name: "Carlos Trabajador",
        token: "trabajador-token-abc",
        redirectPage: "tareas"
    },
    "cliente@gmail.com": { 
        password: "123456", 
        role: "cliente", 
        name: "María Cliente",
        token: "cliente-token-123",
        redirectPage: "servicios-cliente"  // ← Página de servicios para clientes
    }
};

// -----------------------------------------------------------------------------
// 3. PROVIDER - PROVEEDOR DE AUTENTICACIÓN
// -----------------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
    
    // =========================================================================
    // ESTADOS
    // =========================================================================
    
    /**
     * Base de datos de usuarios
     * Se carga desde localStorage o usa DEFAULT_USERS
     */
    const [usersDb, setUsersDb] = useState(() => {
        try {
            const saved = localStorage.getItem('foamwash_users_db');
            return saved ? JSON.parse(saved) : DEFAULT_USERS;
        } catch (e) {
            console.error('Error cargando usuarios:', e);
            return DEFAULT_USERS;
        }
    });
    
    /**
     * Usuario actualmente logueado
     * Se carga desde localStorage si existe una sesión activa
     */
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('foamwash_active_session');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Error cargando sesión:', e);
            return null;
        }
    });
    
    /**
     * Estado de autenticación
     * true si hay un usuario logueado, false si no
     */
    const isAuthenticated = !!user;
    
    // =========================================================================
    // EFECTO: GUARDAR CAMBIOS EN LA BASE DE DATOS
    // =========================================================================
    /**
     * Cada vez que usersDb cambia, guardarlo en localStorage
     * Esto permite que los usuarios registrados persistan
     */
    useEffect(() => {
        try {
            localStorage.setItem('foamwash_users_db', JSON.stringify(usersDb));
        } catch (e) {
            console.error('Error guardando usuarios:', e);
        }
    }, [usersDb]);
    
    // =========================================================================
    // FUNCIÓN: LOGIN
    // =========================================================================
    /**
     * Inicia sesión con email y contraseña
     * 
     * FLUJO MEJORADO:
     * 1. Verificar credenciales
     * 2. Guardar sesión en localStorage
     * 3. Actualizar estado de React
     * 4. Retornar información de redirección
     * 
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {object} Resultado con success, message, role, redirectPage
     */
    const login = (email, password) => {
        console.log('🔐 Intentando login con:', email);
        
        // PASO 1: Buscar usuario en la base de datos
        const foundUser = usersDb[email];
        
        // VALIDACIÓN: ¿Existe el usuario?
        if (!foundUser) {
            console.log('❌ Usuario no encontrado');
            return { 
                success: false, 
                message: "Correo o contraseña incorrectos." 
            };
        }
        
        // VALIDACIÓN: ¿Contraseña correcta?
        if (foundUser.password !== password) {
            console.log('❌ Contraseña incorrecta');
            return { 
                success: false, 
                message: "Correo o contraseña incorrectos." 
            };
        }
        
        // ✅ LOGIN EXITOSO
        
        // PASO 2: Crear objeto de sesión
        const sessionData = { 
            email, 
            role: foundUser.role, 
            name: foundUser.name,
            redirectPage: foundUser.redirectPage || getDefaultRedirect(foundUser.role)
        };
        
        // PASO 3: Guardar sesión en localStorage (PERSISTENCIA)
        try {
            localStorage.setItem('foamwash_active_session', JSON.stringify(sessionData));
            console.log('✅ Sesión guardada en localStorage');
        } catch (e) {
            console.error('Error guardando sesión:', e);
        }
        
        // PASO 4: Actualizar estado de React
        setUser(sessionData);
        
        console.log('✅ Login exitoso:', sessionData);
        
        // PASO 5: Retornar resultado con página de redirección
        return { 
            success: true, 
            message: `¡Bienvenido, ${foundUser.name}!`,
            role: foundUser.role,
            redirectPage: sessionData.redirectPage  // ← IMPORTANTE: Página a cargar
        };
    };
    
    // =========================================================================
    // FUNCIÓN: REGISTER
    // =========================================================================
    /**
     * Registra un nuevo usuario
     * 
     * FLUJO:
     * 1. Validar que el email no exista
     * 2. Crear nuevo usuario
     * 3. Guardar en la base de datos
     * 4. Iniciar sesión automáticamente
     * 
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @param {string} fullName - Nombre completo
     * @param {string} phone - Teléfono (opcional)
     * @param {string} address - Dirección (opcional)
     * @returns {object} Resultado con success, message, role, redirectPage
     */
    const register = (email, password, fullName, phone = '', address = '') => {
        console.log('📝 Intentando registrar:', email);
        
        // VALIDACIÓN 1: ¿El email ya existe?
        if (usersDb[email]) {
            console.log('❌ Email ya registrado');
            return { 
                success: false, 
                message: "El correo ya está registrado." 
            };
        }
        
        // VALIDACIÓN 2: ¿Contraseña válida?
        if (password.length < 6) {
            console.log('❌ Contraseña muy corta');
            return { 
                success: false, 
                message: "La contraseña debe tener al menos 6 caracteres." 
            };
        }
        
        // ✅ REGISTRO VÁLIDO
        
        // PASO 1: Crear nuevo usuario
        const newUser = { 
            password, 
            role: "cliente",  // Nuevos usuarios siempre son clientes
            name: fullName,
            phone,
            address,
            redirectPage: "servicios-cliente"  // Página para clientes
        };
        
        // PASO 2: Actualizar base de datos
        const newDb = { ...usersDb, [email]: newUser };
        setUsersDb(newDb);
        
        // PASO 3: Crear sesión
        const sessionData = { 
            email, 
            role: "cliente", 
            name: fullName,
            redirectPage: "servicios-cliente"
        };
        
        // PASO 4: Guardar sesión en localStorage
        try {
            localStorage.setItem('foamwash_active_session', JSON.stringify(sessionData));
            console.log('✅ Sesión guardada después del registro');
        } catch (e) {
            console.error('Error guardando sesión:', e);
        }
        
        // PASO 5: Actualizar estado
        setUser(sessionData);
        
        console.log('✅ Registro exitoso:', sessionData);
        
        return { 
            success: true, 
            message: "¡Registro exitoso! Iniciando sesión...",
            role: "cliente",
            redirectPage: "servicios-cliente"  // ← IMPORTANTE: Página a cargar
        };
    };
    
    // =========================================================================
    // FUNCIÓN: LOGOUT
    // =========================================================================
    /**
     * Cierra la sesión del usuario
     * Limpia localStorage y el estado de React
     */
    const logout = () => {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar localStorage
        try {
            localStorage.removeItem('foamwash_active_session');
            console.log('✅ Sesión eliminada de localStorage');
        } catch (e) {
            console.error('Error eliminando sesión:', e);
        }
        
        // Limpiar estado
        setUser(null);
        
        console.log('✅ Logout completado');
    };
    
    // =========================================================================
    // FUNCIÓN: OBTENER REDIRECCIÓN POR DEFECTO
    // =========================================================================
    /**
     * Retorna la página por defecto según el rol
     * Se usa como fallback si no hay redirectPage definido
     * 
     * @param {string} role - Rol del usuario
     * @returns {string} Nombre de la página
     */
    const getDefaultRedirect = (role) => {
        switch (role) {
            case 'admin':
                return 'reportes';
            case 'trabajador':
                return 'tareas';
            case 'cliente':
                return 'servicios-cliente';
            default:
                return 'home';
        }
    };
    
    // =========================================================================
    // FUNCIÓN: VERIFICAR PERMISOS
    // =========================================================================
    /**
     * Verifica si el usuario tiene permiso para acceder a ciertos recursos
     * 
     * @param {Array} allowedRoles - Roles permitidos
     * @returns {boolean} true si tiene permiso, false si no
     */
    const checkPermission = (allowedRoles = []) => {
        if (!isAuthenticated) return false;
        if (allowedRoles.length === 0) return true;
        return allowedRoles.includes(user?.role);
    };
    
    // =========================================================================
    // FUNCIÓN: OBTENER PÁGINA DE REDIRECCIÓN
    // =========================================================================
    /**
     * Retorna la página a la que debe ir el usuario según su rol
     * Útil para redirecciones después de ciertas acciones
     * 
     * @returns {string} Nombre de la página
     */
    const getRedirectPage = () => {
        if (!user) return 'home';
        return user.redirectPage || getDefaultRedirect(user.role);
    };
    
    // =========================================================================
    // PROVEEDOR DEL CONTEXTO
    // =========================================================================
    return (
        <AuthContext.Provider value={{
            // ESTADO
            user,                    // Usuario actual
            isAuthenticated,         // ¿Está logueado?
            
            // FUNCIONES
            login,                   // Iniciar sesión
            register,                // Registrar usuario
            logout,                  // Cerrar sesión
            checkPermission,         // Verificar permisos
            getRedirectPage          // Obtener página de redirección
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// -----------------------------------------------------------------------------
// 4. HOOK PERSONALIZADO - useAuth
// -----------------------------------------------------------------------------
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    
    return context;
};

// -----------------------------------------------------------------------------
// 5. COMPONENTE: ProtectedRoute (OPCIONAL)
// -----------------------------------------------------------------------------
export const ProtectedRoute = ({ 
    allowedRoles = [], 
    children, 
    fallback = <div>Acceso denegado</div> 
}) => {
    const { checkPermission } = useAuth();
    
    if (!checkPermission(allowedRoles)) {
        return fallback;
    }
    
    return children;
};

// =============================================================================
// CONCEPTOS CLAVE:
// =============================================================================
//
// 1. PERSISTENCIA CON LOCALSTORAGE:
//    - La sesión se guarda en localStorage
//    - Al recargar la página, la sesión se restaura automáticamente
//    - Los usuarios registrados también persisten
//
// 2. REDIRECCIÓN AUTOMÁTICA:
//    - Cada usuario tiene un campo 'redirectPage'
//    - Al hacer login, se retorna este campo
//    - App.js usa este campo para cargar la página correcta
//
// 3. RESTAURACIÓN DE SESIÓN:
//    - Al iniciar la app, useState(() => {...}) carga desde localStorage
//    - Si hay una sesión guardada, el usuario sigue logueado
//
// 4. FLUJO COMPLETO:
//    1. Usuario hace login
//    2. login() guarda sesión en localStorage
//    3. login() retorna { redirectPage: 'servicios-cliente' }
//    4. App.js recibe este valor y cambia currentPage
//    5. Usuario ve la página correcta
//    6. Si recarga, la sesión se restaura automáticamente
//
// =============================================================================