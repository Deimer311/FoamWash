/**
 * =============================================================================
 * ROLES DEL SISTEMA
 * -----------------------------------------------------------------------------
 * este archivo esta guardado en la subcarpeta constants en la ruta,
 * src\constants\roles.js el archivo fue creadoe el dia 4 de diciembre del 2025
 * por cristian andres criollo tovar, quien es un miembro del equipo de desarrollo
 * del proyecto "FOAM WASH LG".
 * -----------------------------------------------------------------------------
 * ACTUALIZACIONES DEL CODIGO
 * <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>
 * PRIMERA ACTUALIZACCION DEL CODIGO: La actualizacion fue realizada el dia 29 de
 * diciembre del 2025, esta actualizacion se encargo de agregar el metodo
 * getRoleIdByName  // ← AGREGADO, metodo que hacia flata en el archivo anterior.
 * <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>
 * =============================================================================
 */
const ROLES = {
    ADMIN: 'admin',         // ← CORREGIDO
    TRABAJADOR: 'trabajador',
    CLIENTE: 'cliente'
};

const ROLE_IDS = {
    ADMIN: 1,
    TRABAJADOR: 2,
    CLIENTE: 3
};

const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: 3,       // ← CORREGIDO
    [ROLES.TRABAJADOR]: 2,
    [ROLES.CLIENTE]: 1
};

const ROLE_DESCRIPTIONS = {
    [ROLES.ADMIN]: 'Administrador del sistema con acceso completo.',  // ← CORREGIDO
    [ROLES.TRABAJADOR]: 'Empleado con permisos limitados.',
    [ROLES.CLIENTE]: 'Usuario final con acceso básico.'
};

const isValidRole = (role) => {
    return Object.values(ROLES).includes(role);
};

const hasHigherOrEqualRole = (role1, role2) => {
    return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
};

const getAllRoles = () => {
    return Object.values(ROLES);
};

const getRoleIdByName = (roleName) => {
    const roleMap = {
        [ROLES.ADMIN]: ROLE_IDS.ADMIN,
        [ROLES.TRABAJADOR]: ROLE_IDS.TRABAJADOR,
        [ROLES.CLIENTE]: ROLE_IDS.CLIENTE
    };
    
    return roleMap[roleName] || ROLE_IDS.CLIENTE;
};

module.exports = {
    ROLES,
    ROLE_IDS,
    ROLE_HIERARCHY,
    ROLE_DESCRIPTIONS,
    isValidRole,
    hasHigherOrEqualRole,
    getAllRoles,
    getRoleIdByName  // ← AGREGADO
};