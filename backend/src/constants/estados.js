/**
 * =============================================================================
 * ESTADOS DEL SISTEMA
 * Estados estandardizados para diferentes entidades.
 * Cada estado tiene un significado específico dentro del flujo de trabajo.
 * Cada estado está documentado para facilitar su comprensión y uso.
 * Cada estado es utilizado en validaciones y lógica de negocio.
 * Cada estado es exportado para su uso en otros módulos.
 * Cada estado es mantenido de forma centralizada para facilitar actualizaciones.
 * Cada estado es consistente en toda la aplicación.
 * Cada estado es utilizado en reportes y análisis.
 * Cada estado es probado en tests unitarios y de integración.
 * Cada estado es versionado junto con el código de la aplicación.
 * Cada estado es revisado periódicamente para asegurar su relevancia.
 * este archivo se encarga de definir y documentar los estados utilizados en el sistema.
 * Cada estado es representado como una constante para evitar errores tipográficos.
 * el presente archivo esta alojado en la ruta src/constants/estados.js
 * archivo editado el 4 de diciembre de 2025
 * =============================================================================
 */

const ESTADOS_RESERVA = { // Estados para reservas
    PENDIENTE: 'pendiente',// Reserva creada pero no confirmada
    CONFIRMADO: 'confirmado',// Reserva confirmada
    EN_PROCESO: 'en_proceso',// Reserva en proceso de atención
    COMPLETADO: 'completado',// Reserva finalizada
    CANCELADO: 'cancelado'// Reserva cancelada
};

const ESTADOS_COTIZACION = { // Estados para cotizaciones
    PENDIENTE: 'pendiente',// Cotización creada pero no enviada
    ENVIADA: 'enviada',// Cotización enviada al cliente
    ACEPTADA: 'aceptada',// Cotización aceptada por el cliente
    RECHAZADA: 'rechazada',// Cotización rechazada por el cliente
    EXPIRADA: 'expirada'// Cotización que ha caducado
};

const ESTADOS_USUARIO = { // Estados para usuarios  
    ACTIVO: 'activo',// Usuario activo y con acceso
    INACTIVO: 'inactivo',// Usuario inactivo sin acceso
    SUSPENDIDO: 'suspendido',// Usuario suspendido temporalmente
};

//==============================================================================
//VALIDACIONES DE ESTADOS DE RESERVA
//==============================================================================
const isValidEstadoReserva = (estado) => {
    return Object.values(ESTADOS_RESERVA).includes(estado);
};

//==============================================================================
//VALIDACIONES DE ESTADOS DE COTIZACION
//==============================================================================
const isValidEstadoCotizacion = (estado) => {
    return Object.values(ESTADOS_COTIZACION).includes(estado);
};

module.exports = {
    ESTADOS_RESERVA,
    ESTADOS_COTIZACION,
    ESTADOS_USUARIO,
    isValidEstadoReserva,
    isValidEstadoCotizacion
};