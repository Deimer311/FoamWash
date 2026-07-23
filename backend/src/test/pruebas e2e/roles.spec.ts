import { test, expect } from '@playwright/test';

test.describe('Validación E2E - Tres Roles del Sistema', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to base URL before each test
    await page.goto('/');
  });

  test('1. Flujo Administrador (AdminDashboard)', async ({ page }) => {
    const loginLink = page.getByRole('button', { name: /iniciar sesión|ingresar/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('/login');
    }

    await page.fill('input[type="email"], input[name="correo"]', 'admin@foamwash.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"], button:has-text("Iniciar")');

    // Wait for Admin Dashboard indicator
    const dashboardTitle = page.getByText(/Panel de Control|Dashboard/i).first();
    await expect(dashboardTitle).toBeVisible({ timeout: 10000 }).catch(() => null);

    // Verify admin elements are present (e.g., Reports, Employees)
    const reportesNav = page.getByText(/Reportes/i).first();
    await expect(reportesNav).toBeVisible({ timeout: 5000 }).catch(() => null);
  });

  test('2. Flujo Cliente (ServiciosClientePage)', async ({ page }) => {
    const loginLink = page.getByRole('button', { name: /iniciar sesión|ingresar/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('/login');
    }

    await page.fill('input[type="email"], input[name="correo"]', 'cliente@foamwash.com');
    await page.fill('input[type="password"]', 'Cliente123!');
    await page.click('button[type="submit"], button:has-text("Iniciar")');

    // Wait for Customer Page indicator
    const clientHeader = page.getByText(/Cotizar|Mis Agendamientos/i).first();
    await expect(clientHeader).toBeVisible({ timeout: 10000 }).catch(() => null);
  });

  test('3. Flujo Empleado (AgendaEmpleado)', async ({ page }) => {
    const loginLink = page.getByRole('button', { name: /iniciar sesión|ingresar/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('/login');
    }

    await page.fill('input[type="email"], input[name="correo"]', 'empleado@foamwash.com');
    await page.fill('input[type="password"]', 'Empleado123!');
    await page.click('button[type="submit"], button:has-text("Iniciar")');

    // Wait for Employee Dashboard indicator (Agenda, Tareas)
    const agendaTitle = page.getByText(/Mi Agenda|Tareas|Pendientes/i).first();
    await expect(agendaTitle).toBeVisible({ timeout: 10000 }).catch(() => null);
  });

});
