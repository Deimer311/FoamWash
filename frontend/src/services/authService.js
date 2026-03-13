/**
 * =============================================================================
 * SERVICIOS DE AUTENTICACIÓN - CON COOKIES HTTP-ONLY (CORREGIDO)
 * =============================================================================
 * Se han ajustado las propiedades para que coincidan con el DTO de NestJS.
 * El backend espera 'email', por lo que enviamos 'email: correo'.
 * =============================================================================
 */

import api from './api';

const authService = {
    //==================================================
    // REGISTRO DE USUARIO
    //==================================================
    register: async (userData) => {
        try {
            // Aseguramos que si el objeto trae 'correo', lo enviamos como 'email'
            const dataToRequest = {
                ...userData,
                email: userData.email || userData.correo 
            };
            
            console.log('📝 Registrando usuario:', dataToRequest.email);
            
            const response = await api.post('/auth/register', dataToRequest);
            console.log('✅ Usuario registrado:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('❌ Error en register:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al registrar' } };
        }
    },

    //==================================================
    // INICIO DE SESIÓN
    //==================================================
    login: async (correo, password) => {
        try {
            console.log('🔐 Iniciando sesión para:', correo);
            
            // ✅ CORRECCIÓN: Se envía 'email' porque NestJS no reconoce 'correo'
            const response = await api.post('/auth/login', { 
                email: correo, 
                password: password 
            });
            
            console.log('✅ Sesión iniciada:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error en login:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al iniciar sesión' } };
        }
    },

    //==================================================
    // LOGOUT
    //==================================================
    logout: async () => {
        try {
            console.log('🚪 Cerrando sesión...');
            const response = await api.post('/auth/logout');
            console.log('✅ Sesión cerrada');
            return response.data;
        } catch (error) {
            console.error('❌ Error en logout:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al cerrar sesión' } };
        }
    },

    //==================================================
    // GET ME
    //==================================================
    getMe: async () => {
        try {
            console.log('👤 Obteniendo perfil del usuario');
            const response = await api.get('/auth/me');
            console.log('✅ Perfil obtenido:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error en getMe:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error de perfil' } };
        }
    },

    //==================================================
    // RECUPERACIÓN DE CONTRASEÑA (También corregidos)
    //==================================================
    requestPasswordReset: async (correo) => {
        try {
            console.log('📧 Solicitando recuperación para:', correo);
            const response = await api.post('/auth/request-password-reset', { email: correo });
            return response.data;
        } catch (error) {
            console.error('❌ Error en requestPasswordReset:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: 'Error al solicitar recuperación' } };
        }
    },

    verifyResetCode: async (correo, codigo) => {
        try {
            const response = await api.post('/auth/verify-reset-code', { email: correo, codigo });
            return response.data;
        } catch (error) {
            console.error('❌ Error en verifyResetCode:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: 'Error al verificar código' } };
        }
    },

    resetPassword: async (correo, codigo, nuevaPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { 
                email: correo, 
                codigo, 
                nuevaPassword 
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error en resetPassword:', error);
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: 'Error al restablecer contraseña' } };
        }
    },
};

export default authService;