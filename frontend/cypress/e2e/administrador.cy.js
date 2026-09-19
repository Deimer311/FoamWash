describe('Flujo de Administrador E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="boton-iniciar-sesion"]').click();
  });

  it('Debe permitir al administrador iniciar sesión y navegar por el panel', () => {
    cy.get('[data-testid="input-correo-login"]').type('admin@gmail.com');
    cy.get('[data-testid="input-password-login"]').type('123456');
    cy.get('[data-testid="boton-submit-login"]').click();

    cy.contains('Panel de Control', { timeout: 10000 }).should('exist');
    cy.contains('Ingresos totales').should('exist');

    cy.contains('Últimas reservas').should('exist');

    cy.contains('Empleados activos').should('exist');
  });
});
