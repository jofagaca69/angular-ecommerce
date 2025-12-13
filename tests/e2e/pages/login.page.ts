import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Login
 * Basado en Lab 3: Functional Verification at System Level
 */
export class LoginPage {
  readonly page: Page;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;
  readonly keypad: Locator;

  constructor(page: Page) {
    this.page = page;
    // Selectores basados en el HTML real del componente
    this.phoneInput = page.locator('input[formControlName="phone"]');
    this.passwordInput = page.locator('input[formControlName="password"]');
    this.loginButton = page.locator('button:has-text("Ingresar")');
    this.registerButton = page.locator('button:has-text("Crear cuenta")');
    this.errorMessage = page.locator('.text-red-600');
    this.keypad = page.locator('app-numeric-keypad');
  }

  /**
   * Navega a la página de login
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Ingresa el teléfono usando el keypad numérico
   * Nota: El sistema usa un keypad numérico personalizado
   */
  async enterPhone(phone: string) {
    await this.phoneInput.click();
    // Esperar a que aparezca el keypad
    await this.keypad.waitFor({ state: 'visible' });
    
    // Ingresar cada dígito usando el keypad
    // El keypad tiene botones con números del 1-9, luego 0, y un botón "✓" para done
    for (const digit of phone) {
      const digitNum = parseInt(digit);
      if (digitNum === 0) {
        // El 0 está en la segunda fila, posición específica
        await this.page.locator('button:has-text("0")').click();
      } else {
        // Los números 1-9 están en la grilla
        await this.page.locator(`button:has-text("${digitNum}")`).first().click();
      }
    }
    
    // Cerrar el keypad con el botón "✓" (checkmark)
    await this.page.locator('button:has-text("✓")').click();
    // Esperar a que el keypad desaparezca
    await this.keypad.waitFor({ state: 'hidden' }).catch(() => {});
  }

  /**
   * Ingresa la contraseña usando el keypad numérico
   */
  async enterPassword(password: string) {
    await this.passwordInput.click();
    // Esperar a que aparezca el keypad
    await this.keypad.waitFor({ state: 'visible' });
    
    // Ingresar cada dígito
    for (const digit of password) {
      const digitNum = parseInt(digit);
      if (digitNum === 0) {
        await this.page.locator('button:has-text("0")').click();
      } else {
        await this.page.locator(`button:has-text("${digitNum}")`).first().click();
      }
    }
    
    // Cerrar el keypad
    await this.page.locator('button:has-text("✓")').click();
    await this.keypad.waitFor({ state: 'hidden' }).catch(() => {});
  }

  /**
   * Realiza el login completo
   */
  async login(phone: string, password: string) {
    await this.enterPhone(phone);
    await this.enterPassword(password);
    await this.loginButton.click();
  }

  /**
   * Verifica que la página de login esté cargada correctamente
   * FR-01: El sistema debe proporcionar una página de login con campos para teléfono y contraseña
   */
  async verifyLoginPageLoaded() {
    await this.phoneInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
  }

  /**
   * Verifica que se muestra un mensaje de error
   */
  async verifyErrorMessageShown() {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.textContent();
  }

  /**
   * Verifica que NO se muestra mensaje de error
   */
  async verifyNoErrorMessage() {
    const errorVisible = await this.errorMessage.isVisible().catch(() => false);
    return !errorVisible;
  }
}

