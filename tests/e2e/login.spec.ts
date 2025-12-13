import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { TestUsers, Routes, Timeouts } from './fixtures/test-data';

/**
 * Tests E2E para la funcionalidad de Login
 * Basado en Lab 3: Functional Verification at System Level
 * 
 * Requisitos Funcionales:
 * FR-01: El sistema debe proporcionar una página de login con campos para teléfono y contraseña
 * FR-02: Cuando se proporcionan credenciales válidas, el sistema debe autenticar al usuario
 * FR-03: Tras la autenticación, el sistema debe redirigir al usuario al Dashboard
 * FR-04: Si las credenciales son inválidas, el sistema debe mostrar un mensaje de error sin redirigir
 */

test.describe('Login Functional Requirements', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  /**
   * FR-01: El sistema debe proporcionar una página de login con campos para teléfono y contraseña
   */
  test('FR-01: Debe mostrar página de login con campos de teléfono y contraseña', async () => {
    // Verificar que los elementos están presentes y visibles
    await loginPage.verifyLoginPageLoaded();
    
    // Verificar que los campos son accesibles
    await expect(loginPage.phoneInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    // Verificar placeholders o labels
    await expect(loginPage.phoneInput).toHaveAttribute('placeholder', 'Teléfono');
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Contraseña');
    
    // Verificar que la URL es correcta
    await expect(loginPage.page).toHaveURL(/.*\/login/);
  });

  /**
   * FR-02: Cuando se proporcionan credenciales válidas, el sistema debe autenticar al usuario
   * FR-03: Tras la autenticación, el sistema debe redirigir al usuario al Dashboard
   * 
   * Nota: Este test requiere que exista un usuario válido en el sistema.
   * Para el propósito del lab, asumimos que hay un usuario de prueba.
   * En un entorno real, esto se configuraría en el setup del test.
   */
  test('FR-02 y FR-03: Debe autenticar y redirigir con credenciales válidas', async ({ page }) => {
    // Credenciales de prueba (deben existir en el sistema)
    // Nota: Estas credenciales deben ser configuradas en el setup del entorno de pruebas
    const { phone: validPhone, password: validPassword } = TestUsers.validClient;
    
    // Realizar login
    await loginPage.login(validPhone, validPassword);
    
    // FR-02: Verificar autenticación exitosa
    // Esperar a que la navegación ocurra (no debe estar en /login)
    await page.waitForURL(
      (url) => !url.pathname.includes('/login'), 
      { timeout: Timeouts.navigation }
    );
    
    // FR-03: Verificar redirección al dashboard
    // El sistema redirige a /dashboard para usuarios normales o /admin/dashboard para admins
    const currentUrl = page.url();
    expect(
      currentUrl.includes('/dashboard') || 
      currentUrl.includes('/admin/dashboard') ||
      currentUrl.includes('/home')
    ).toBeTruthy();
    
    // Verificar que no hay mensaje de error
    const hasError = await loginPage.verifyNoErrorMessage();
    expect(hasError).toBeTruthy();
  });

  /**
   * FR-04: Si las credenciales son inválidas, el sistema debe mostrar un mensaje de error sin redirigir
   */
  test('FR-04: Debe mostrar error con credenciales inválidas sin redirigir', async ({ page }) => {
    const { phone: invalidPhone, password: invalidPassword } = TestUsers.invalid;
    
    // Intentar login con credenciales inválidas
    await loginPage.login(invalidPhone, invalidPassword);
    
    // Esperar un momento para que el sistema procese la respuesta
    await page.waitForTimeout(Timeouts.api);
    
    // Verificar que NO se redirigió (debe permanecer en /login)
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verificar que se muestra un mensaje de error
    const errorMessage = await loginPage.verifyErrorMessageShown();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.length).toBeGreaterThan(0);
    
    // Verificar que el mensaje de error es visible
    await expect(loginPage.errorMessage).toBeVisible();
  });

  /**
   * Test adicional: Verificar que el botón de login está deshabilitado cuando el formulario es inválido
   */
  test('El botón de login debe estar deshabilitado cuando el formulario es inválido', async () => {
    // Inicialmente, sin datos, el botón debe estar deshabilitado
    await expect(loginPage.loginButton).toBeDisabled();
    
    // Ingresar solo teléfono (sin contraseña)
    await loginPage.enterPhone('3214');
    await expect(loginPage.loginButton).toBeDisabled();
    
    // Ingresar solo contraseña (sin teléfono completo)
    // Limpiar el teléfono primero (usando backspace)
    await loginPage.phoneInput.click();
    await loginPage.keypad.waitFor({ state: 'visible' });
    // Hacer varios backspaces para limpiar
    for (let i = 0; i < 4; i++) {
      await loginPage.page.locator('button:has-text("←")').click();
    }
    await loginPage.page.locator('button:has-text("✓")').click();
    
    await loginPage.enterPassword('3214');
    await expect(loginPage.loginButton).toBeDisabled();
  });

  /**
   * Test adicional: Verificar navegación al registro
   */
  test('Debe permitir navegar a la página de registro', async ({ page }) => {
    await loginPage.registerButton.click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});

