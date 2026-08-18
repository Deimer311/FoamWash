const { test, expect } = require('@playwright/test');

test('Inicio de sesión exitoso', async ({ page }) => {

  // Abrir la aplicación
  await page.goto('http://localhost:3000/');

  // Navegar al login
  await page.locator('.login-btn').click();

  // Escribir usuario
  await page.locator('input[type="email"]').fill('admin@gmail.com');

  // Escribir contraseña
  await page.locator('input[type="password"]').fill('123456');

  // Dar clic en Iniciar sesión
  await page.locator('button[type="submit"]').click();


  // Verificar que ingresó correctamente al dashboard
  await expect(page.locator('text=Panel de Control')).toBeVisible({ timeout: 10000 });

});
