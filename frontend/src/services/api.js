    // src/services/api.js
    // ============================================================
    // Configuración de Axios con soporte dual:
    // - Navegador web: usa cookies HttpOnly automáticamente
    // - App móvil (Capacitor): usa localStorage + Authorization header
    //
    // ¿Cómo funciona el modo móvil?
    // 1. Detectamos si estamos en Capacitor con window.Capacitor
    // 2. En móvil, guardamos el token en localStorage después del login
    // 3. En cada petición, agregamos el header Authorization: Bearer <token>
    // 4. También enviamos x-client-type: mobile para que el backend
    //    sepa que no debe usar cookies en la respuesta
    // ============================================================

    import axios from 'axios';

    // ── Detección de entorno ──────────────────────────────────────
    // window.Capacitor existe cuando la app corre en un dispositivo Android/iOS
    // En el navegador web normal, window.Capacitor es undefined
    const IS_MOBILE = typeof window !== 'undefined' && !!window.Capacitor;

    // ── Clave para guardar el token en localStorage (solo móvil) ──
    const TOKEN_KEY = 'foamwash_access_token';

    // ── Helpers para manejar el token en localStorage ────────────

    // Guarda el token después del login (solo en móvil)
    export const saveToken = (token) => {
    if (IS_MOBILE && token) {
        localStorage.setItem(TOKEN_KEY, token);
    }
    };

    // Obtiene el token guardado (solo en móvil)
    export const getToken = () => {
    if (IS_MOBILE) {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
    };

    // Elimina el token al cerrar sesión (solo en móvil)
    export const removeToken = () => {
    if (IS_MOBILE) {
        localStorage.removeItem(TOKEN_KEY);
    }
    };

    // ── Creación de la instancia de Axios ────────────────────────
    const api = axios.create({
    // URL base del backend — usa la variable de entorno o localhost en desarrollo
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    // Tiempo máximo de espera por respuesta (10 segundos)
    timeout: 10000,

    headers: {
        'Content-Type': 'application/json',
    },

    // withCredentials: true → necesario para enviar/recibir cookies en el navegador web
    // En móvil no afecta porque Capacitor no maneja cookies como el navegador
    withCredentials: true,
    });

    // ── Interceptor de peticiones ─────────────────────────────────
    // Se ejecuta ANTES de cada petición HTTP
    // Agrega los headers necesarios según el entorno (web o móvil)
    api.interceptors.request.use(
    (config) => {
        if (IS_MOBILE) {
        // ── Headers para app móvil ──────────────────────────────

        // Le decimos al backend que somos una app móvil
        // Así sabe que no debe usar cookies y puede devolver el token en el body
        config.headers['x-client-type'] = 'mobile';

        // Obtenemos el token guardado en localStorage
        const token = getToken();

        if (token) {
            // Enviamos el token en el header Authorization
            // El backend lo lee en la JwtStrategy y autentica al usuario
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        }
        // En web no hacemos nada — las cookies se envían automáticamente
        // gracias a withCredentials: true

        return config;
    },
    (error) => {
        // Si hay error al preparar la petición, lo rechazamos
        return Promise.reject(error);
    }
    );

    // ── Interceptor de respuestas ──────────────────────────────────
    // Se ejecuta DESPUÉS de recibir cada respuesta HTTP
    api.interceptors.response.use(
    (response) => {
        // ── Guardar token automáticamente después del login/register ──
        // Si la respuesta trae un access_token y estamos en móvil,
        // lo guardamos en localStorage para usarlo en peticiones futuras
        if (IS_MOBILE && response.data?.access_token) {
        saveToken(response.data.access_token);
        }

        // Respuesta exitosa: la devolvemos tal cual
        return response;
    },
    (error) => {
        // ── Manejo de errores de autenticación ────────────────────
        if (error.response?.status === 401 && IS_MOBILE) {
        // En móvil, si el servidor responde 401 (no autenticado),
        // eliminamos el token guardado porque ya no es válido
        removeToken();
        }

        // Rechazamos el error para que el componente que hizo la petición
        // pueda manejarlo con try/catch o .catch()
        return Promise.reject(error);
    }
    );

    export default api;