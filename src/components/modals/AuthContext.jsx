    /**
     * =============================================================================
     * AUTH CONTEXT - CON COOKIES HTTP-ONLY (SIN BUCLE INFINITO)
     * =============================================================================
     * actualmente alojado en: src/components/AuthContext.jsx
     * =============================================================================
     */

    import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
    import authService from '../../services/authService';

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
        
        const [user, setUser]           = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const isAuthenticated           = !!user;

        // ✅ useRef evita que el efecto se ejecute dos veces en React StrictMode
        const initialized = useRef(false);

        // =========================================================================
        // EFECTO: RESTAURAR SESIÓN AL CARGAR — UNA SOLA VEZ
        // =========================================================================
        
        useEffect(() => {
            // Evitar doble ejecución (React StrictMode monta dos veces en desarrollo)
            if (initialized.current) return;
            initialized.current = true;

            const initAuth = async () => {
                console.log('🔄 Verificando sesión...');
                
                try {
                    const response = await authService.getMe();
                    
                    if (response && response.success) {
                        console.log('✅ Sesión restaurada');
                        setUser(response.data);
                    } else {
                        console.log('ℹ️ Sin sesión activa');
                        setUser(null);
                    }
                    
                } catch (error) {
                    // El error 401 es normal (usuario no logueado), no es un fallo
                    console.log('ℹ️ Sin sesión activa:', error?.response?.status || error?.message);
                    setUser(null);
                    // ❌ NO llamar a localStorage aquí — causa re-renders
                } finally {
                    setIsLoading(false);
                }
            };
            
            initAuth();
        }, []); // ← Array vacío: solo se ejecuta UNA vez al montar

        // =========================================================================
        // LOGIN
        // =========================================================================
        
        const login = async (correo, password) => {
            try {
                console.log('🔐 Iniciando login:', correo);
                
                const response = await authService.login(correo, password);
                
                if (!response.success) {
                    return {
                        success: false,
                        message: response.error?.message || 'Error al iniciar sesión'
                    };
                }
                
                const { user } = response.data;
                setUser(user);
                
                console.log('✅ Login exitoso');
                
                return {
                    success: true,
                    message: `¡Bienvenido, ${user.nombre}!`,
                    role: user.role,
                    redirectPage: getRedirectByRole(user.role)
                };
                
            } catch (error) {
                console.error('❌ Error en login:', error);
                return {
                    success: false,
                    message: error?.error?.message || 'Error al iniciar sesión'
                };
            }
        };

        // =========================================================================
        // REGISTER
        // =========================================================================
        
        const register = async (userData) => {
            try {
                console.log('📝 Registrando usuario:', userData.email || userData.correo);
                
                const backendData = {
                    nombre:          userData.fullName    || userData.nombre,
                    correo:          userData.email       || userData.correo,
                    password:        userData.password,
                    telefono:        userData.phone       || userData.telefono  || null,
                    direccion:       userData.address     || userData.direccion || null,
                    tipoDocumentoId: userData.tipoDocumentoId || 1,
                    role: 'cliente'
                };
                
                const response = await authService.register(backendData);
                
                if (!response.success) {
                    return {
                        success: false,
                        message: response.error?.message || 'Error al registrar usuario'
                    };
                }
                
                const { user } = response.data;
                setUser(user);
                
                console.log('✅ Registro exitoso');
                
                return {
                    success: true,
                    message: '¡Registro exitoso! Iniciando sesión...',
                    role: user.role,
                    redirectPage: 'servicios-cliente'
                };
                
            } catch (error) {
                console.error('❌ Error en register:', error);
                return {
                    success: false,
                    message: error?.error?.message || 'Error al registrar usuario'
                };
            }
        };

        // =========================================================================
        // LOGOUT
        // =========================================================================
        
        const logout = async () => {
            try {
                console.log('🚪 Cerrando sesión...');
                await authService.logout();
            } catch (error) {
                console.error('❌ Error al cerrar sesión:', error);
            } finally {
                // Siempre limpiar el estado, aunque el endpoint falle
                setUser(null);
                console.log('✅ Sesión cerrada');
            }
        };

        // =========================================================================
        // HELPERS
        // =========================================================================
        
        const getRedirectByRole = (role) => {
            const map = {
                'admin':      'reportes',
                'trabajador': 'tareas',
                'cliente':    'servicios-cliente'
            };
            return map[role] || 'home';
        };

        const checkPermission = (allowedRoles = []) => {
            if (!isAuthenticated) return false;
            if (allowedRoles.length === 0) return true;
            return allowedRoles.includes(user?.role);
        };

        const getRedirectPage = () => {
            if (!user) return 'home';
            return getRedirectByRole(user.role);
        };

        // =========================================================================
        // PROVEEDOR
        // =========================================================================
        
        return (
            <AuthContext.Provider value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                checkPermission,
                getRedirectPage
            }}>
                {children}
            </AuthContext.Provider>
        );
    };

    // =========================================================================
    // HOOK PERSONALIZADO
    // =========================================================================

    export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) {
            throw new Error('useAuth debe usarse dentro de AuthProvider');
        }
        return context;
    };

    // =========================================================================
    // COMPONENTE: ProtectedRoute
    // =========================================================================

    export const ProtectedRoute = ({ 
        allowedRoles = [], 
        children, 
        fallback = <div>Acceso denegado</div> 
    }) => {
        const { checkPermission, isLoading } = useAuth();
        
        if (isLoading) return <div>Cargando...</div>;
        if (!checkPermission(allowedRoles)) return fallback;
        
        return children;
    };