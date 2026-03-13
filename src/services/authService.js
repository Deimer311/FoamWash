    /**
     * =============================================================================
     * SERVICIOS DE AUTENTICACIÓN - CON COOKIES HTTP-ONLY
     * =============================================================================
     * CAMBIO PRINCIPAL: Ya no manejamos tokens en localStorage
     * Los tokens se envían automáticamente en cookies
     * el servicio de autenticación se ha modificado para adaptarse al nuevo enfoque de manejo de tokens a través de cookies HTTP-Only, eliminando cualquier referencia a localStorage o manejo manual de tokens en el frontend.
     * las funciones de registro y login ahora simplemente llaman a las rutas correspondientes, y las cookies se gestionan automáticamente por el navegador.
     * se agregó una nueva función de logout para llamar a la ruta de logout en el backend, que se encargará de limpiar las cookies y los tokens en la base de datos.
     * el servicio sigue proporcionando métodos para interactuar con la autenticación, pero ahora con un enfoque más seguro y simplificado para el manejo de tokens.
     * este cambio mejora la seguridad al mantener los tokens fuera del alcance de JavaScript, reduciendo el riesgo de ataques XSS.
     * actualizado por última vez: el 16 de febrero del 2026
     * actualmente alojado en: src/services/authService.js
     * =============================================================================
     */

    import api from './api';

    const authService = {
        //==================================================
        // REGISTRO DE USUARIO - MODIFICADO
        //==================================================
        /**
         * Registra un nuevo usuario en el sistema.
         * @param {Object} userData - Datos del usuario
         * @returns {Promise<Object>} - { success, message, data: { user } }
         * ❌ YA NO RETORNA tokens (vienen en cookies)
         */
        register: async (userData) => {
            try {
                console.log('📝 Registrando usuario:', userData.correo);
                
                // ✅ Enviar datos al backend
                const response = await api.post('/auth/register', userData);
                
                console.log('✅ Usuario registrado:', response.data);
                
                // ✅ Las cookies se establecen automáticamente
                // ❌ NO necesitamos hacer nada con los tokens
                
                return response.data;
                
            } catch (error) {
                console.error('❌ Error en register:', error);
                
                if (error.response) {
                    throw error.response.data;
                }
                
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al registrar usuario'
                    }
                };
            }
        },

        //==================================================
        // INICIO DE SESIÓN - MODIFICADO
        //==================================================
        /**
         * Inicia sesión
         * @param {string} correo - Email del usuario
         * @param {string} password - Contraseña del usuario
         * @returns {Promise<Object>} - { success, message, data: { user } }
         * ❌ YA NO RETORNA tokens (vienen en cookies)
         */
        login: async (correo, password) => {
            try {
                console.log('🔐 Iniciando sesión para:', correo);
                
                // ✅ Enviar credenciales
                const response = await api.post('/auth/login', { correo, password });
                
                console.log('✅ Sesión iniciada:', response.data);
                
                // ✅ Las cookies se establecen automáticamente
                // ❌ NO necesitamos guardar tokens manualmente
                
                return response.data;
                
            } catch (error) {
                console.error('❌ Error en login:', error);
                
                if (error.response) {
                    throw error.response.data;
                }
                
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al iniciar sesión'
                    }
                };
            }
        },

        //==================================================
        // LOGOUT - NUEVO
        //==================================================
        /**
         * Cierra sesión (limpia cookies y BD)
         * @returns {Promise<Object>}
         */
        logout: async () => {
            try {
                console.log('🚪 Cerrando sesión...');
                
                const response = await api.post('/auth/logout');
                
                console.log('✅ Sesión cerrada');
                
                return response.data;
                
            } catch (error) {
                console.error('❌ Error en logout:', error);
                
                if (error.response) {
                    throw error.response.data;
                }
                
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al cerrar sesión'
                    }
                };
            }
        },

        //==================================================
        // GET ME - SIN CAMBIOS (las cookies se envían automáticamente)
        //==================================================
        /**
         * Obtiene información del usuario logueado
         * @returns {Promise<Object>} - { success, message, data: { user } }
         */
        getMe: async () => {
            try {
                console.log('👤 Obteniendo perfil del usuario');
                
                // ✅ La cookie con el token se envía automáticamente
                const response = await api.get('/auth/me');
                
                console.log('✅ Perfil obtenido:', response.data);
                
                return response.data;
                
            } catch (error) {
                console.error('❌ Error en getMe:', error);
                
                if (error.response) {
                    throw error.response.data;
                }
                
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al obtener perfil del usuario'
                    }
                };
            }
        },

        //==================================================
        // RECUPERACIÓN DE CONTRASEÑA - SIN CAMBIOS
        //==================================================
        requestPasswordReset: async (correo) => {
            try {
                console.log('📧 Solicitando código de recuperación para:', correo);
                const response = await api.post('/auth/request-password-reset', { correo });
                console.log('✅ Código enviado');
                return response.data;
            } catch (error) {
                console.error('❌ Error en requestPasswordReset:', error);
                if (error.response) {
                    throw error.response.data;
                }
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al solicitar recuperación'
                    }
                };
            }
        },

        verifyResetCode: async (correo, codigo) => {
            try {
                console.log('🔍 Verificando código');
                const response = await api.post('/auth/verify-reset-code', { correo, codigo });
                return response.data;
            } catch (error) {
                console.error('❌ Error en verifyResetCode:', error);
                if (error.response) {
                    throw error.response.data;
                }
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al verificar código de recuperación'
                    }
                };
            }
        },

        resetPassword: async (correo, codigo, nuevaPassword) => {
            try {
                console.log('🔒 Restableciendo contraseña para:', correo);
                const response = await api.post('/auth/reset-password', { 
                    correo, 
                    codigo, 
                    nuevaPassword 
                });
                console.log('✅ Contraseña restablecida');
                return response.data;
            } catch (error) {
                console.error('❌ Error en resetPassword:', error);
                if (error.response) {
                    throw error.response.data;
                }
                throw {
                    success: false,
                    error: {
                        message: error.message || 'Error al restablecer contraseña'
                    }
                };
            }
        },
    };

    export default authService;