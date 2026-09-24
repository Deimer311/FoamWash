describe('Flujo de Trabajador E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="boton-iniciar-sesion"]').click();
  });

  it('Debe permitir al trabajador iniciar sesión, ver su agenda y actualizar estado', () => {
    cy.get('[data-testid="input-correo-login"]').clear().type('trabajador@gmail.com');
    cy.get('[data-testid="input-password-login"]').clear().type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();
    cy.wait(1500);

    cy.contains('Mis Órdenes', { timeout: 10000 }).should('exist');

    // Cambiar estado de la primera orden disponible
    cy.get('[data-testid="select-estado-orden"]').first().select('En Proceso');
    
    // Verificar que el estado cambie visualmente
    cy.contains('En Proceso').should('exist');
  });
});
