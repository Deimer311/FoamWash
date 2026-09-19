describe('Flujo de Cliente E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="boton-iniciar-sesion"]').click();
  });

  it('Debe permitir a un cliente iniciar sesión, cotizar y agendar un servicio', () => {
    cy.get('[data-testid="input-correo-login"]').type('cliente@gmail.com');
    cy.get('[data-testid="input-password-login"]').type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    
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
});
