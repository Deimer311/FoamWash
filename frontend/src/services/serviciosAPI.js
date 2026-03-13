// =============================================================================
// SERVICIOSAPI.JS - TODAS LAS FUNCIONES PARA CONSUMIR EL BACKEND
// =============================================================================

import api from './api';

// =============================================================================
// 📦 SERVICIOS
// =============================================================================

export const serviciosService = {
    // Obtener todos los servicios
    getAll: async () => {
        try {
            const response = await api.get('/servicios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios:', error);
            throw error;
        }
    },

    // Obtener un servicio por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/servicios/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener servicio ${id}:`, error);
            throw error;
        }
    },

    // Crear nuevo servicio
    create: async (servicio) => {
        try {
            const response = await api.post('/servicios', servicio);
            return response.data;
        } catch (error) {
            console.error('Error al crear servicio:', error);
            throw error;
        }
    },

    // Actualizar servicio
    update: async (id, servicio) => {
        try {
            const response = await api.put(`/servicios/${id}`, servicio);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar servicio ${id}:`, error);
            throw error;
        }
    },

    // Eliminar servicio
    delete: async (id) => {
        try {
            const response = await api.delete(`/servicios/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar servicio ${id}:`, error);
            throw error;
        }
    },

    // Analytics: Servicios más solicitados
    getMasSolicitados: async () => {
        try {
            const response = await api.get('/servicios/analytics/mas-solicitados');
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios más solicitados:', error);
            throw error;
        }
    }
};

// =============================================================================
// 👥 USUARIOS
// =============================================================================

export const usuariosService = {
    // Obtener todos los usuarios
    getAll: async () => {
        try {
            const response = await api.get('/usuarios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    // Obtener usuario por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/usuarios/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener usuario ${id}:`, error);
            throw error;
        }
    },

    // Crear usuario
    create: async (usuario) => {
        try {
            const response = await api.post('/usuarios', usuario);
            return response.data;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    },

    // Actualizar usuario
    update: async (id, usuario) => {
        try {
            const response = await api.put(`/usuarios/${id}`, usuario);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar usuario ${id}:`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/usuarios/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar usuario ${id}:`, error);
            throw error;
        }
    },

    // Analytics: Usuarios por rol
    getPorRol: async () => {
        try {
            const response = await api.get('/usuarios/analytics/usuarios-por-rol');
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios por rol:', error);
            throw error;
        }
    },

    // Historial completo de cliente
    getHistorialCliente: async (id) => {
        try {
            // Antes tenías '/usuarios/analytics/historial-cliente/${id}'
            // Ahora coincide exactamente con tu Backend
            const response = await api.get(`/usuarios/${id}/historial`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener historial del cliente ${id}:`, error);
            throw error;
        }
    },
};

// =============================================================================
// 📅 RESERVAS
// =============================================================================

export const reservasService = {
    // Obtener todas las reservas
    getAll: async () => {
        try {
            const response = await api.get('/reservas');
            return response.data;
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            throw error;
        }
    },

    // Obtener reservas por estado
    getByEstado: async (estado) => {
        try {
            const response = await api.get(`/reservas/estado/${estado}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener reservas por estado ${estado}:`, error);
            throw error;
        }
    },

    // Crear reserva
    create: async (reserva) => {
        try {
            const response = await api.post('/reservas', reserva);
            return response.data;
        } catch (error) {
            console.error('Error al crear reserva:', error);
            throw error;
        }
    },

    // Actualizar estado de reserva
    updateEstado: async (id, estado) => {
        try {
            const response = await api.put(`/reservas/${id}`, { Estado: estado });
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar reserva ${id}:`, error);
            throw error;
        }
    }
};

// =============================================================================
// 💰 COTIZACIONES
// =============================================================================

export const cotizacionesService = {
    // Obtener todas las cotizaciones
    getAll: async () => {
        try {
            const response = await api.get('/cotizaciones');
            return response.data;
        } catch (error) {
            console.error('Error al obtener cotizaciones:', error);
            throw error;
        }
    },

    // Crear cotización
    create: async (cotizacion) => {
        try {
            const response = await api.post('/cotizaciones', cotizacion);
            return response.data;
        } catch (error) {
            console.error('Error al crear cotización:', error);
            throw error;
        }
    }
};

// =============================================================================
// 📊 ESTADÍSTICAS
// =============================================================================

export const estadisticasService = {
    // Obtener dashboard general
    getDashboard: async () => {
        try {
            const response = await api.get('/estadisticas');
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
};

// =============================================================================
// 🔔 NOTIFICACIONES
// =============================================================================

export const notificacionesService = {
    // Obtener notificaciones de un usuario
    getByUserId: async (userId) => {
        try {
            const response = await api.get(`/notificaciones/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener notificaciones del usuario ${userId}:`, error);
            throw error;
        }
    },

    // Crear notificación
    create: async (notificacion) => {
        try {
            const response = await api.post('/notificaciones', notificacion);
            return response.data;
        } catch (error) {
            console.error('Error al crear notificación:', error);
            throw error;
        }
    }
};

// =============================================================================
// 📋 CONSULTAS (Las 10 consultas principales)
// =============================================================================

export const consultasService = {
    // Consulta 1: Usuarios por rol
    usuariosPorRol: async () => {
        try {
            const response = await api.get('/consultas/1-usuarios-por-rol');
            return response.data;
        } catch (error) {
            console.error('Error en consulta 1:', error);
            throw error;
        }
    },

    // Consulta 2: Servicios disponibles
    serviciosDisponibles: async () => {
        try {
            const response = await api.get('/consultas/2-servicios-disponibles');
            return response.data;
        } catch (error) {
            console.error('Error en consulta 2:', error);
            throw error;
        }
    },

    // Consulta 3: Servicios por cliente
    serviciosPorCliente: async () => {
        try {
            const response = await api.get('/consultas/3-servicios-por-cliente');
            return response.data;
        } catch (error) {
            console.error('Error en consulta 3:', error);
            throw error;
        }
    },

    // Consulta 5: Clientes de esta semana
    clientesSemana: async () => {
        try {
            const response = await api.get('/consultas/5-clientes-semana');
            return response.data;
        } catch (error) {
            console.error('Error en consulta 5:', error);
            throw error;
        }
    },

    // Consulta 6: Reservas por servicio
    reservasPorServicio: async () => {
        try {
            const response = await api.get('/consultas/6-reservas-por-servicio');
            return response.data;
        } catch (error) {
            console.error('Error en consulta 6:', error);
            throw error;
        }
    },

    // Obtener todas las consultas
    todas: async () => {
        try {
            const response = await api.get('/consultas/todas');
            return response.data;
        } catch (error) {
            console.error('Error al obtener todas las consultas:', error);
            throw error;
        }
    }
};

// =============================================================================
// 🔄 EXPORTAR TODO
// =============================================================================

export default {
    servicios: serviciosService,
    usuarios: usuariosService,
    reservas: reservasService,
    cotizaciones: cotizacionesService,
    estadisticas: estadisticasService,
    notificaciones: notificacionesService,
    consultas: consultasService
};