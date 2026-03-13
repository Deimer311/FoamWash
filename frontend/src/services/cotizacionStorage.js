/**
 * ============================================================================
 * COTIZACION STORAGE SERVICE
 * ============================================================================
 * Maneja la persistencia de cotizaciones:
 * - Antes de login: guarda en localStorage con TTL de 22 horas
 * - Al hacer login: sincroniza automáticamente con la BD
 * - Exportar el hook useCotizacionStorage para usarlo en los componentes
 * ============================================================================
 */

import api from './api';

const STORAGE_KEY   = 'fw_cotizacion';
const TTL_MS        = 22 * 60 * 60 * 1000; // 22 horas en milisegundos

// ── Leer del localStorage ────────────────────────────────────────────────────
export const leerCotizacionLocal = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const data = JSON.parse(raw);

        // Verificar TTL: si ya pasaron 22h, limpiar y retornar null
        if (Date.now() - data.timestamp > TTL_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return data;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
};

// ── Guardar en localStorage ──────────────────────────────────────────────────
export const guardarCotizacionLocal = (items) => {
    const data = {
        items,                      // Array de { servicioId, nombre, precio, cantidad, tamano }
        timestamp: Date.now(),      // Para calcular TTL
        expiresAt: Date.now() + TTL_MS
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// ── Limpiar localStorage ─────────────────────────────────────────────────────
export const limpiarCotizacionLocal = () => {
    localStorage.removeItem(STORAGE_KEY);
};

// ── Verificar si la cotización local ha expirado ─────────────────────────────
export const cotizacionLocalExpirada = () => {
    const data = leerCotizacionLocal();
    return data === null;
};

// ── Sincronizar cotización local con la BD al iniciar sesión ─────────────────
// Llama a POST /api/cotizaciones/sincronizar con todos los items pendientes
export const sincronizarCotizacionConBD = async (userId) => {
    try {
        const data = leerCotizacionLocal();
        if (!data || !data.items || data.items.length === 0) {
            return { success: true, sincronizados: 0 };
        }

        const res = await api.post('/cotizaciones/sincronizar', {
            userId,
            items: data.items.map(item => ({
                id:       item.id       || item.servicioId,
                nombre:   item.nombre,
                precio:   item.precio,
                cantidad: item.cantidad || 1,
                tamano:   item.tamano   || 'Estándar'
            }))
        });

        if (res.data.success) {
            limpiarCotizacionLocal(); // solo limpia si el backend confirmó
            return {
                success:      true,
                sincronizados: res.data.sincronizados || 0,
                actualizados:  res.data.actualizados  || 0
            };
        }

        return { success: false, error: res.data.message };
    } catch (error) {
        console.error('❌ Error al sincronizar cotización con BD:', error);
        return { success: false, error: error.message };
    }
};

// ── Obtener cotizaciones del usuario desde la BD ─────────────────────────────
export const obtenerCotizacionesUsuario = async (userId) => {
    try {
        const res = await api.get(`/cotizaciones/usuario/${userId}`);
        return res.data.success ? res.data.data : [];
    } catch (error) {
        console.error('❌ Error al obtener cotizaciones:', error);
        return [];
    }
};

// ── Calcular tiempo restante del TTL en formato legible ──────────────────────
export const tiempoRestanteCotizacion = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const data = JSON.parse(raw);
        const restanteMs = data.expiresAt - Date.now();

        if (restanteMs <= 0) return null;

        const horas   = Math.floor(restanteMs / (1000 * 60 * 60));
        const minutos = Math.floor((restanteMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${horas}h ${minutos}m`;
    } catch {
        return null;
    }
};