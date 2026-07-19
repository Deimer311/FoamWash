/**
 * RNF-009: Permitir ampliación de funcionalidades
 * Módulo NUEVO que se integra al sistema. Representa, por ejemplo,
 * un futuro módulo de reportes para FoamWash.
 * No modifica ni depende de los módulos existentes (health, empleados, etc.).
 */

function generarReporteEmpleados(empleados) {
  if (!Array.isArray(empleados)) {
    throw new Error('Se esperaba un arreglo de empleados');
  }
  return {
    totalEmpleados: empleados.length,
    nombres: empleados.map((e) => e.nombre),
  };
}

module.exports = { generarReporteEmpleados };
