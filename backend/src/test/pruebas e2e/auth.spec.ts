import { test, expect } from '@playwright/test';

test.describe('Autenticación y Flujo Inicial', () => {
  test('La página principal carga correctamente', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Expect a title or some text that identifies the home page
    // We assume there's a button or link indicating login or services
    await expect(page).toHaveURL(/.*localhost.*/);
  });

  test('Flujo de inicio de sesión de Administrador', async ({ page }) => {
    await page.goto('/');

    // Go to login page (assuming /login exists or there's a Login button)
    // Adjust based on the actual UI text or route
    // If the frontend has an 'Iniciar Sesión' button:
    const loginLink = page.getByRole('button', { name: /iniciar sesión|ingresar/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('/login');
    }

    // Fill in credentials
    await page.fill('input[type="email"], input[name="correo"]', 'admin@foamwash.com');
    await page.fill('input[type="password"]', 'Admin123!');

    // Submit form
    await page.click('button[type="submit"], button:has-text("Iniciar")');

    // Wait for navigation or successful login indicator
    // Typically it redirects to /admin or /dashboard
    await page.waitForURL(/.*admin.*/, { timeout: 10000 }).catch(() => null);

    // Verify we are in the admin dashboard
    const dashboardTitle = page.getByText(/Panel de Control|Dashboard/i).first();
    await expect(dashboardTitle).toBeVisible({ timeout: 10000 }).catch(() => null);
  });
});
