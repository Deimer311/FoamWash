/**
 * =============================================================================
 * CONFIGURACIÓN DE AXIOS - CON SOPORTE PARA COOKIES
 * =============================================================================
 * actualmente alojado en: src/services/api.js
 * =============================================================================
 * - Configura una instancia de Axios con baseURL, timeout, headers y withCredentials.
 * - El interceptor de respuestas es simple: no intenta refresh automático.
 *   Esto evita bucles infinitos en caso de tokens expirados o inválidos.
 * - Las rutas protegidas en el backend requieren un token JWT válido en las cookies.
 * - El frontend debe manejar los errores 401 para redirigir al login o mostrar mensajes.
 * - El backend debe enviar cookies HTTP-only con el token JWT al hacer login.
 * - El controlador authController maneja la lógica de cada ruta.
 * - El middleware authenticateToken verifica la autenticación antes de acceder a rutas protegidas.
 * - Las rutas disponibles son:
 *  - POST /api/auth/register: Registrar nuevo usuario
 *   - POST /api/auth/login: Iniciar sesión (devuelve cookie con token)
 *  - GET  /api/auth/me: Obtener datos del usuario autenticado
 * - POST /api/auth/logout: Cerrar sesión (opcional)
 * Nota: Las rutas protegidas requieren un token JWT válido en las cookies.
 * - El controlador authController maneja la lógica de cada ruta.
 * - El middleware authenticateToken verifica la autenticación antes de acceder a rutas protegidas.
 * =============================================================================
 */

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true  // Permite enviar/recibir cookies automáticamente
});

// ✅ Interceptor SIMPLE — sin lógica de refresh automático
// Redirige al login si la sesión ha expirado para evitar pantallas rotas.
api.interceptors.response.use(
    (response) => response,       // Respuesta exitosa: devolverla tal cual
    (error)    => {
        if (error.response && error.response.status === 401) {
            // Evitar redirecciones infinitas si ya estamos en /login
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                console.warn('Sesión expirada (401). Redirigiendo al login...');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;