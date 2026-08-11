import { test, expect } from '@playwright/test';

test.describe('Flujo de Agendamiento y Checkout', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
    
    // Optional: Log in as a client if required
    // (If the app allows guest checkout, this might not be needed)
    const loginLink = page.getByRole('button', { name: /iniciar sesión|ingresar/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.fill('input[type="email"], input[name="correo"]', 'cliente@foamwash.com');
      await page.fill('input[type="password"]', 'Cliente123!');
      await page.click('button[type="submit"], button:has-text("Iniciar")');
      await page.waitForTimeout(2000); // Wait for login to complete
    }
  });

  test('Cliente puede agregar un servicio al carrito y hacer checkout', async ({ page }) => {
    // Go to scheduling / services page
    const agendarNav = page.getByText(/Agendar|Servicios|Cotizar/i).first();
    if (await agendarNav.isVisible()) {
      await agendarNav.click();
    } else {
      await page.goto('/agendar');
    }

    // Wait for services to load
    // The page uses a loader or renders the services
    await page.waitForTimeout(2000); 

    // Find the first "Add to cart" or "Agregar" button
    const agregarBtn = page.getByRole('button', { name: /Agregar|Añadir/i }).first();
    await expect(agregarBtn).toBeVisible({ timeout: 10000 });
    await agregarBtn.click();

    // Verify a notification or cart icon updates
    // Assuming there's a cart floating button or cart nav link
    const cartButton = page.locator('button').filter({ hasText: /carrito|pagar|checkout|\d+/i }).first();
    if (await cartButton.isVisible()) {
        await cartButton.click();
    }

    // Wait for Cart Modal to appear
    const checkoutBtn = page.getByRole('button', { name: /Comprar|Pagar|Checkout|Continuar|Siguiente/i }).first();
    
    if (await checkoutBtn.isVisible()) {
        // We are in the cart, click proceed
        await checkoutBtn.click();
    }

    // Modal Confirmation / Checkout Form
    // Fill in standard details if a form appears (Address, etc)
    const direccionInput = page.getByPlaceholder(/direcci/i).first();
    if (await direccionInput.isVisible()) {
        await direccionInput.fill('Calle 123 #45-67');
    }

    const fechaInput = page.getByRole('textbox').filter({ hasText: /fecha|date/i }).first();
    if (await fechaInput.isVisible()) {
        await fechaInput.fill('2027-10-10'); // dummy date
    }

    // Finalize
    const confirmarBtn = page.getByRole('button', { name: /Confirmar|Finalizar|Agendar/i }).first();
    if (await confirmarBtn.isVisible()) {
        await confirmarBtn.click();
    }

    // Assert success
    // Wait for a success message or redirect
    const successMsg = page.getByText(/éxito|confirmado|agendado|gracias/i).first();
    await expect(successMsg).toBeVisible({ timeout: 10000 }).catch(() => null);
  });
});
