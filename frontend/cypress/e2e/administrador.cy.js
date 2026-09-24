// =============================================================================
// 📘 GUÍA RÁPIDA: ¿CÓMO SE CREAN Y CÓMO FUNCIONAN LAS PRUEBAS CON CYPRESS?
// =============================================================================
//
// 1️⃣ ¿Qué es Cypress?
// Es una herramienta de pruebas "End-to-End" (E2E) o de extremo a extremo.
// Su objetivo es simular a un usuario real interactuando con la aplicación 
// en un navegador web (hace clics, escribe, navega, etc.).
//
// 2️⃣ Estructura Básica:
// - describe('...', () => {...}): Agrupa un conjunto de pruebas relacionadas.
// - beforeEach(() => {...}): Código que se ejecuta ANTES de cada prueba 'it'. 
//   Aquí generalmente visitamos la página ('/') para empezar desde cero.
// - it('...', () => {...}): Define una prueba específica (un caso de uso).
//
// 3️⃣ Comandos más utilizados (Cy):
// - cy.visit(url): Navega a una ruta (por defecto, la baseUrl configurada).
// - cy.get(selector): Busca un elemento en la pantalla. Lo mejor es usar
//   'data-testid' porque las clases (css) pueden cambiar si modificas el diseño.
// - .type('texto'): Simula escribir en un campo de texto. Usamos .clear() antes 
//   para asegurarnos de que el campo esté limpio.
// - .click(): Simula hacer clic en el botón o elemento encontrado.
// - cy.contains('Texto'): Busca un elemento por el texto que muestra en pantalla.
// - .should('exist'): Aserción que confirma que algo pasó con éxito 
//   (ej. que un mensaje de error o un menú realmente apareció).
//
// 4️⃣ Sincronización y Esperas (Tiempos):
// Cypress es rapidísimo. A veces hace clic antes de que el servidor responda o
// una animación termine. Por eso usamos parámetros como { timeout: 10000 } para
// decirle "busca esto y si no está, espera hasta 10 segundos antes de fallar",
// o usamos `cy.wait(1500)` para pausar obligatoriamente (por ej. si hay animaciones).
// =============================================================================

describe('Flujo de Administrador E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="boton-iniciar-sesion"]').click();
  });

  it('Debe permitir al administrador iniciar sesión y navegar por el panel', () => {
    cy.get('[data-testid="input-correo-login"]').clear().type('admin@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    cy.wait(1500);

    cy.contains('Panel de Control', { timeout: 10000 }).should('exist');
    cy.contains('Ingresos totales').should('exist');

    cy.contains('Últimas reservas').should('exist');

    cy.contains('Empleados activos').should('exist');
  });

  it('Debe poder navegar a las secciones de Servicios y Empleados', () => {
    cy.get('[data-testid="input-correo-login"]').clear().type('admin@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    cy.wait(1500);

    // Abrir dropdown de Gestión
    cy.contains('Gestión').click();

    // Navegar a servicios
    cy.contains('Servicios').click();
    cy.contains('Gestiona el catálogo de servicios', { timeout: 10000 }).should('exist');

    // Abrir dropdown de Gestión de nuevo para Empleados
    cy.contains('Gestión').click();

    // Navegar a empleados
    cy.contains('Empleados').click();
    cy.contains('colaborador', { matchCase: false, timeout: 10000 }).should('exist');
  });

  it('Debe poder abrir y cerrar el formulario de un Nuevo Servicio', () => {
    cy.get('[data-testid="input-correo-login"]').clear().type('admin@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    cy.wait(1500);

    // Abrir dropdown de Gestión
    cy.contains('Gestión').click();

    // Navegar a servicios
    cy.contains('Servicios').click();
    
    // Clic en Agregar Servicio
    cy.contains('Agregar Servicio', { timeout: 10000 }).click();

    // Verificar que el modal se abre
    cy.contains('Nuevo Servicio', { timeout: 10000 }).should('exist');

    // Cerrar el modal
    cy.contains('Cancelar').click();
    
    // El modal ya no debería mostrarse
    cy.contains('Nuevo Servicio').should('not.exist');
  });
});
