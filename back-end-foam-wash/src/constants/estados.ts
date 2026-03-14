/**
 * ESTADOS PARA RESERVAS
 * Define el flujo de vida de una cita/reserva.
 */
export enum ESTADOS_RESERVA {
  PENDIENTE = 'pendiente',    // Creada pero no confirmada
  CONFIRMADO = 'confirmado',  // Confirmada
  EN_PROCESO = 'en_proceso',  // En atención
  COMPLETADO = 'completado',  // Finalizada
  CANCELADO = 'cancelado',    // Anulada
}

/**
 * ESTADOS PARA COTIZACIONES
 */
export enum ESTADOS_COTIZACION {
  PENDIENTE = 'pendiente',    // Creada pero no enviada
  ENVIADA = 'enviada',        // Enviada al cliente
  ACEPTADA = 'aceptada',      // Aceptada por el cliente
  RECHAZADA = 'rechazada',    // Rechazada por el cliente
  EXPIRADA = 'expirada',      // Caducada
}

/**
 * ESTADOS PARA USUARIOS
 */
export enum ESTADOS_USUARIO {
  ACTIVO = 'activo',          // Con acceso
  INACTIVO = 'inactivo',      // Sin acceso
  SUSPENDIDO = 'suspendido',  // Suspensión temporal
}

// ==============================================================================
// VALIDACIONES (NestJS Style)
// ==============================================================================

/**
 * Verifica si un string es un estado de reserva válido
 */
export const isValidEstadoReserva = (estado: any): estado is ESTADOS_RESERVA => {
  return Object.values(ESTADOS_RESERVA).includes(estado as ESTADOS_RESERVA);
};

/**
 * Verifica si un string es un estado de cotización válido
 */
export const isValidEstadoCotizacion = (estado: any): estado is ESTADOS_COTIZACION => {
  return Object.values(ESTADOS_COTIZACION).includes(estado as ESTADOS_COTIZACION);
};