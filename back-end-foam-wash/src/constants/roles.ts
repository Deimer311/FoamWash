/**
 * =============================================================================
 * ROLES DEL SISTEMA - FOAM WASH LG
 * =============================================================================
 */

export enum ROLES {
  ADMIN = 'admin',
  TRABAJADOR = 'trabajador',
  CLIENTE = 'cliente',
}

export const ROLE_IDS = {
  [ROLES.ADMIN]: 1,
  [ROLES.TRABAJADOR]: 2,
  [ROLES.CLIENTE]: 3,
} as const;

export const ROLE_HIERARCHY: Record<ROLES, number> = {
  [ROLES.ADMIN]: 3,
  [ROLES.TRABAJADOR]: 2,
  [ROLES.CLIENTE]: 1,
};

export const ROLE_DESCRIPTIONS: Record<ROLES, string> = {
  [ROLES.ADMIN]: 'Administrador del sistema con acceso completo.',
  [ROLES.TRABAJADOR]: 'Empleado con permisos limitados.',
  [ROLES.CLIENTE]: 'Usuario final con acceso básico.',
};

// ==============================================================================
// FUNCIONES DE UTILIDAD
// ==============================================================================

/**
 * Verifica si un string es un rol válido
 */
export const isValidRole = (role: any): role is ROLES => {
  return Object.values(ROLES).includes(role as ROLES);
};

/**
 * Compara jerarquías (útil para proteger rutas)
 */
export const hasHigherOrEqualRole = (roleToCheck: ROLES, roleRequired: ROLES): boolean => {
  return ROLE_HIERARCHY[roleToCheck] >= ROLE_HIERARCHY[roleRequired];
};

/**
 * Retorna lista de nombres de roles
 */
export const getAllRoles = (): ROLES[] => {
  return Object.values(ROLES);
};

/**
 * Obtiene el ID numérico de la BD a partir del nombre del rol
 */
export const getRoleIdByName = (roleName: ROLES | string): number => {
  return ROLE_IDS[roleName as ROLES] || ROLE_IDS[ROLES.CLIENTE];
};