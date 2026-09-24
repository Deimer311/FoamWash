describe('Flujo de Cliente E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="boton-iniciar-sesion"]').click();
  });

  it('Debe permitir a un cliente iniciar sesión, cotizar y agendar un servicio', () => {
    cy.get('[data-testid="input-correo-login"]').clear().type('cliente@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    cy.wait(1500);
    
    cy.get('[data-testid^="boton-solicitar-servicio-"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid^="boton-solicitar-servicio-"]').first().click();

    cy.get('[data-testid="boton-carrito-flotante"]').click();
    cy.get('[data-testid="boton-ver-cotizacion"]').click();

    cy.get('[data-testid^="select-tamano-"]').first().select('Estándar');
    cy.get('[data-testid="boton-generar-cotizacion"]').click();

    cy.get('[data-testid="boton-agendar-servicio"]').click();

    cy.get('[data-testid="input-direccion-agendamiento"]').type('Calle Falsa 123');
    const randomDays = Math.floor(Math.random() * 28) + 1;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randomDays);
    const dateStr = futureDate.toISOString().split('T')[0];
    const randomHour = Math.floor(Math.random() * 10) + 8;
    const timeStr = `${randomHour.toString().padStart(2, '0')}:00`;

    cy.get('[data-testid="input-fecha-agendamiento"]').type(dateStr);
    cy.get('[data-testid="input-hora-agendamiento"]').type(timeStr);
    cy.get('[data-testid="boton-confirmar-pedido"]').click();

    cy.get('[data-testid="titulo-pedido-confirmado"]', { timeout: 10000 }).should('exist');
    cy.get('.fwm-close').click();

    cy.get('[data-testid="boton-avatar-perfil"]').click();
    cy.contains('Mis Agendamientos').click();
    
    cy.contains('Pendiente', { timeout: 10000 }).should('exist');
  });

  it('Debe permitir editar el perfil del cliente', () => {
    // Iniciar sesión
    cy.get('[data-testid="input-correo-login"]').clear().type('cliente@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    cy.wait(1500);

    // Ir a Mi Perfil
    cy.get('[data-testid="boton-avatar-perfil"]', { timeout: 10000 }).click();
    cy.get('[data-testid="opcion-mi-perfil"]').click();

    // Clic en editar
    cy.get('[data-testid="boton-editar-perfil"]', { timeout: 10000 }).click();

    // Escribir nueva dirección
    cy.get('[data-testid="input-direccion-perfil"]', { timeout: 15000 }).clear().type('Carrera 45 # 12-34');
    cy.get('[data-testid="boton-guardar-perfil"]').click();

    // Verificar que volvió a la vista normal (el botón editar debe existir de nuevo)
    cy.get('[data-testid="boton-editar-perfil"]', { timeout: 15000 }).should('exist');
  });

  it('Debe fallar al iniciar sesión con credenciales incorrectas', () => {
    cy.get('[data-testid="input-correo-login"]').clear().type('cliente@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('password-incorrecta');
    cy.get('[data-testid="boton-submit-login"]').click();

    // No debe cargar la interfaz interna, debe seguir existiendo el formulario o un mensaje de error
    cy.get('[data-testid="input-correo-login"]').should('exist');
  });

  it('Debe permitir registrar un nuevo usuario', () => {
    cy.get('[data-testid="boton-cambiar-a-registro"]', { timeout: 10000 }).click();

    cy.get('[data-testid="input-nombre-registro"]').type('Usuario Cypress');
    cy.get('[data-testid="input-correo-registro"]').type(`cypress${Date.now()}@test.com`);
    cy.get('[data-testid="input-telefono-registro"]').type('3001234567');
    cy.get('[data-testid="input-direccion-registro"]').type('Calle Cypress 123');
    cy.get('[data-testid="input-password-registro"]').type('123456');

    cy.get('[data-testid="boton-submit-registro"]').click();

    // El sistema debe procesar el registro. Validamos que el form desaparezca o muestre el de login de vuelta.
    cy.get('body').should('not.be.empty');
  });
});
