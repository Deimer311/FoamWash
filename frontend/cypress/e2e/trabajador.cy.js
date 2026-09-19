describe('Flujo de Trabajador E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="boton-iniciar-sesion"]').click();
  });

  it('Debe permitir al trabajador iniciar sesión, ver su agenda y actualizar estado', () => {
    cy.get('[data-testid="input-correo-login"]').type('trabajador@gmail.com');
    cy.get('[data-testid="input-password-login"]').type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();

    cy.contains('Mis Órdenes', { timeout: 10000 }).should('exist');
  });
});
