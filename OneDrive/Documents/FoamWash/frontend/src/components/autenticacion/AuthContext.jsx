// =============================================================================
// ARCHIVO  : AuthContext.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/autenticacion/AuthContext.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Contexto global de autenticación. Provee login, logout, register y el estado del usuario a toda la app.
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import authService from '../../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser]           = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated           = !!user;
    const initialized               = useRef(false);

    // =========================================================================
    // Normaliza el rol del backend al rol que usa el frontend en rutas/guards.
    // Backend devuelve "empleado" → frontend usa "trabajador"
    // =========================================================================
    const normalizeRole = (rawUser) => {
        if (!rawUser) return null;
        // El rol puede venir en distintas formas según el endpoint:
        //   login/register → rawUser.rol  (string directo)
        //   getMe          → rawUser.rol.Rol (objeto con campo Rol)
        const rolStr = (
            rawUser.rol?.Rol ||
            rawUser.rol       ||
            rawUser.role      ||
            ''
        ).toLowerCase();

        const mapped = rolStr === 'empleado' ? 'trabajador' : rolStr;
        return { ...rawUser, role: mapped };
    };

    // =========================================================================
    // EFECTO: restaurar sesión al cargar
    // =========================================================================
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initAuth = async () => {
            try {
                const response = await authService.getMe();
                if (response?.success) {
                    setUser(normalizeRole(response.data));
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // =========================================================================
    // LOGIN
    // =========================================================================
    const login = async (correo, password) => {
        try {
            const response = await authService.login(correo, password);

            if (!response.success) {
                return { success: false, message: response.error?.message || 'Error al iniciar sesión' };
            }

            // El backend devuelve: { success, data: { id, nombre, correo, rol, foto_perfil } }
            const rawUser = response.data;
            const normalized = normalizeRole(rawUser);
            setUser(normalized);

            return {
                success: true,
                message: `¡Bienvenido, ${normalized.nombre}!`,
                role: normalized.role,
                redirectPage: getRedirectByRole(normalized.role),
            };
        } catch (error) {
            return { success: false, message: error?.error?.message || 'Error al iniciar sesión' };
        }
    };

    // =========================================================================
    // REGISTER
    // =========================================================================
    const register = async (userData) => {
        try {
            const backendData = {
                nombre:          userData.fullName    || userData.nombre,
                correo:          userData.email       || userData.correo,
                password:        userData.password,
                telefono:        userData.phone       || userData.telefono  || null,
                direccion:       userData.address     || userData.direccion || null,
                tipoDocumentoId: userData.tipoDocumentoId || 1,
                role: 'cliente',
            };

            const response = await authService.register(backendData);

            if (!response.success) {
                return { success: false, message: response.error?.message || 'Error al registrar usuario' };
            }

            const rawUser = response.data;
            const normalized = normalizeRole(rawUser);
            setUser(normalized);

            return {
                success: true,
                message: '¡Registro exitoso! Iniciando sesión...',
                role: normalized.role,
                redirectPage: 'servicios-cliente',
            };
        } catch (error) {
            return { success: false, message: error?.error?.message || 'Error al registrar usuario' };
        }
    };

    // =========================================================================
    // LOGOUT
    // =========================================================================
    const logout = async () => {
        try {
            await authService.logout();
        } catch {
            // ignorar errores de red al cerrar sesión
        } finally {
            setUser(null);
        }
    };

    // =========================================================================
    // HELPERS
    // =========================================================================
    const getRedirectByRole = (role) => {
        const map = {
            'admin':      'admin-dashboard',
            'trabajador': 'agenda-empleado',
            'cliente':    'servicios-cliente',
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

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            register,
            logout,
            checkPermission,
            getRedirectPage,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
};

export const ProtectedRoute = ({ allowedRoles = [], children, fallback = <div>Acceso denegado</div> }) => {
    const { checkPermission, isLoading } = useAuth();
    if (isLoading) return <div>Cargando...</div>;
    if (!checkPermission(allowedRoles)) return fallback;
    return children;
};
