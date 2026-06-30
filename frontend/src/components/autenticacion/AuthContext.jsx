// =============================================================================
// ARCHIVO  : AuthContext.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/autenticacion/AuthContext.jsx
// FIXES:
//   ✅ normalizeRole: spread ...rawUser va PRIMERO, campos normalizados DESPUÉS
//      (antes era al revés → los valores nuevos eran pisados por los originales)
//   ✅ updateUser: merge simple sin pasar por normalizeRole
//   ✅ refreshUser: recarga usuario completo desde backend (nuevo export)
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
    // normalizeRole
    // ✅ FIX: ...rawUser va PRIMERO para que los campos normalizados siempre
    // prevalezcan. Antes estaban al final, lo que permitía que claves del
    // rawUser (como foto_perfil: null) pisaran los valores actualizados.
    // =========================================================================
    const normalizeRole = (rawUser) => {
        if (!rawUser) return null;

        const rolStr = (
            rawUser.rol?.Rol ||
            rawUser.rol       ||
            rawUser.role      ||
            ''
        ).toLowerCase();

        const mapped = rolStr === 'empleado' ? 'trabajador' : rolStr;

        return {
            // Primero los campos crudos (base)
            ...rawUser,
            // Luego los normalizados — SIEMPRE sobreescriben lo anterior
            id:          rawUser.id          ?? rawUser.Id_Usuario,
            nombre:      rawUser.nombre      ?? rawUser.Nombre,
            correo:      rawUser.correo      ?? rawUser.Correo,
            telefono:    rawUser.telefono    ?? rawUser.Telefono    ?? null,
            direccion:   rawUser.direccion   ?? rawUser.Direccion   ?? null,
            foto_perfil: rawUser.foto_perfil ?? null,
            role:        mapped,
        };
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

            const rawUser = response.data;
            const normalized = normalizeRole(rawUser);
            setUser(normalized);

            if (import.meta.env.DEV && response.access_token) {
                console.log(`🔑 [Dev Only] Token para Swagger:\n${response.access_token}`);
            }

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
            try {
                localStorage.removeItem('foamwash_carrito');
                localStorage.removeItem('foamwash_pedidos');
                localStorage.removeItem('foamwash_carrito_local');
            } catch (e) {
                console.error(e);
            }
            setUser(null);
        }
    };

    // =========================================================================
    // UPDATE USER
    // ✅ FIX: merge directo sin pasar por normalizeRole
    // normalizeRole forzaba foto_perfil: null si rawUser no tenía el campo,
    // lo que pisaba actualizaciones parciales como updateUser({ foto_perfil: '/...' })
    // =========================================================================
    const updateUser = (campos) => {
        setUser(prev => {
            if (!prev) return prev;
            return { ...prev, ...campos };
        });
    };

    // =========================================================================
    // REFRESH USER (NUEVO)
    // Recarga el perfil completo desde el backend. Llamar después de guardar
    // foto o datos del perfil para garantizar consistencia total con la DB.
    // =========================================================================
    const refreshUser = async () => {
        try {
            const response = await authService.getMe();
            if (response?.success) {
                setUser(normalizeRole(response.data));
            }
        } catch (err) {
            console.error('❌ Error al refrescar usuario:', err);
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
            updateUser,
            refreshUser,       // ← nuevo: exportado para uso en formularios de perfil
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