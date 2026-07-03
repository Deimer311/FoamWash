import api from './api';

const authService = {

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al registrar usuario' } };
        }
    },

    login: async (correo, password) => {
        try {
            const response = await api.post('/auth/login', { correo, password });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al iniciar sesión' } };
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al cerrar sesión' } };
        }
    },

    getMe: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al obtener perfil' } };
        }
    },

    requestPasswordReset: async (correo) => {
        try {
            const response = await api.post('/auth/request-password-reset', { correo });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al solicitar recuperación' } };
        }
    },

    // FIX: backend espera { token } — el código de 6 dígitos ES el token
    verifyResetCode: async (correo, codigo) => {
        try {
            const response = await api.post('/auth/verify-reset-code', { token: codigo });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al verificar código' } };
        }
    },

    // FIX: backend espera { token, newPassword }, no correo/nuevaPassword
    resetPassword: async (correo, codigo, nuevaPassword) => {
        try {
            const response = await api.post('/auth/reset-password', {
                token: codigo,
                newPassword: nuevaPassword,
            });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            throw { success: false, error: { message: error.message || 'Error al restablecer contraseña' } };
        }
    },
};

export default authService;
