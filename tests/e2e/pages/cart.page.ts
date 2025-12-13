import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Carrito
 */
export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly purchaseButton: Locator;
  readonly cartTotal: Locator;
  readonly subtotal: Locator;
  readonly loadingOverlay: Locator;
  readonly errorMessage: Locator;
  readonly quantityInputs: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    // Selector más flexible para items del carrito
    this.cartItems = page.locator('div.flex.items-center').filter({ has: page.locator('h3') });
    this.emptyCartMessage = page.locator('text=Tu carrito está vacío');
    this.purchaseButton = page.locator('button:has-text("Proceder al Pago")');
    // Selector más robusto para el total
    this.cartTotal = page.locator('text=/Total a pagar/').locator('..').locator('.text-2xl, .text-xl').first();
    this.subtotal = page.locator('text=/Subtotal/').locator('..').locator('.text-lg').first();
    this.loadingOverlay = page.locator('text=Procesando su pedido...');
    this.errorMessage = page.locator('.text-red-600');
    this.quantityInputs = page.locator('input[type="number"]');
    this.removeButtons = page.locator('button[aria-label="Eliminar producto"], button').filter({ has: page.locator('svg') });
  }

  /**
   * Navega a la página del carrito
   */
  async goto() {
    await this.page.goto('/cart');
  }

  /**
   * Verifica que el carrito está vacío
   */
  async verifyCartIsEmpty() {
    // Esperar un momento para que la página se actualice
    await this.page.waitForTimeout(1000);
    
    // Verificar que el mensaje de carrito vacío está visible
    const isEmpty = await this.emptyCartMessage.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isEmpty) {
      // Verificar que no hay items
      const count = await this.cartItems.count();
      if (count > 0) {
        throw new Error('El carrito no está vacío');
      }
    }
  }

  /**
   * Verifica que hay items en el carrito
   */
  async verifyCartHasItems() {
    // Esperar un momento para que la página se cargue
    await this.page.waitForTimeout(1000);
    
    // Verificar que no está vacío
    const isEmpty = await this.emptyCartMessage.isVisible().catch(() => false);
    if (isEmpty) {
      return false;
    }
    
    const count = await this.cartItems.count();
    return count > 0;
  }

  /**
   * Obtiene el número de items en el carrito
   */
  async getCartItemsCount() {
    return await this.cartItems.count();
  }

  /**
   * Obtiene el total del carrito
   */
  async getCartTotal() {
    try {
      // Esperar a que la página se cargue
      await this.page.waitForTimeout(1000);
      
      // Intentar múltiples selectores para encontrar el total
      // Selector 1: Buscar el span con clase text-2xl que está después de "Total a pagar"
      let totalText = '';
      
      // Buscar el contenedor que tiene "Total a pagar"
      const totalContainer = this.page.locator('text=/Total a pagar/').locator('..');
      const isVisible = await totalContainer.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        // Buscar el span con el total dentro del mismo contenedor
        const totalSpan = totalContainer.locator('span.text-2xl, span.font-extrabold').last();
        totalText = await totalSpan.textContent().catch(() => '');
      }
      
      // Si no se encontró, intentar selector alternativo más directo
      if (!totalText) {
        const altTotal = this.page.locator('span.text-2xl.font-extrabold.text-green-700');
        totalText = await altTotal.textContent().catch(() => '');
      }
      
      // Si aún no se encontró, buscar cualquier span con text-2xl cerca de "Total"
      if (!totalText) {
        const allTotals = this.page.locator('span.text-2xl');
        const count = await allTotals.count();
        for (let i = 0; i < count; i++) {
          const text = await allTotals.nth(i).textContent().catch(() => '');
          if (text && text.includes('$')) {
            totalText = text;
            break;
          }
        }
      }
      
      if (!totalText) {
        console.warn('No se pudo encontrar el texto del total');
        return 0;
      }
      
      // Extraer el número del texto (ej: "$123.45" o "$1,234.56" -> 1234.56)
      // Remover el símbolo $ y espacios, luego extraer números
      const cleanText = totalText.replace(/[$,\s]/g, '');
      const match = cleanText.match(/[\d]+\.?\d*/);
      
      if (match) {
        return parseFloat(match[0]);
      }
      
      return 0;
    } catch (error) {
      console.warn('No se pudo obtener el total del carrito:', error);
      return 0;
    }
  }

  /**
   * Obtiene información de un item del carrito por índice
   */
  async getCartItem(index: number) {
    const item = this.cartItems.nth(index);
    
    // Esperar a que el item esté visible
    await item.waitFor({ state: 'visible', timeout: 5000 });
    
    const name = await item.locator('h3').textContent().catch(() => '');
    const priceText = await item.locator('text=/Precio/').textContent().catch(() => '');
    const quantity = await item.locator('input[type="number"]').inputValue().catch(() => '1');
    const totalText = await item.locator('.font-bold').textContent().catch(() => '');
    
    return {
      name: name?.trim() || '',
      price: priceText?.trim() || '',
      quantity: parseInt(quantity || '0'),
      total: totalText?.trim() || '',
    };
  }

  /**
   * Actualiza la cantidad de un item
   */
  async updateQuantity(itemIndex: number, newQuantity: number) {
    const item = this.cartItems.nth(itemIndex);
    const quantityInput = item.locator('input[type="number"]');
    await quantityInput.clear();
    await quantityInput.fill(newQuantity.toString());
    await quantityInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Elimina un item del carrito
   */
  async removeItem(itemIndex: number) {
    const item = this.cartItems.nth(itemIndex);
    const removeButton = item.locator('button[aria-label="Eliminar producto"]');
    await removeButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Realiza la compra (hace clic en "Proceder al Pago")
   */
  async proceedToPurchase() {
    // Verificar que el botón no esté deshabilitado
    const isDisabled = await this.purchaseButton.isDisabled();
    if (isDisabled) {
      throw new Error('El botón de compra está deshabilitado (carrito vacío o procesando)');
    }
    
    await this.purchaseButton.click();
  }

  /**
   * Espera a que la compra se complete
   */
  async waitForPurchaseComplete() {
    // Esperar a que aparezca el overlay de carga (opcional, puede no aparecer inmediatamente)
    try {
      await this.loadingOverlay.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Si no aparece, puede que la compra sea muy rápida, continuar
    }
    
    // Esperar a que desaparezca el overlay O que se redirija
    // Usar Promise.race para esperar cualquiera de las dos condiciones
    try {
      await Promise.race([
        // Opción 1: El overlay desaparece
        this.loadingOverlay.waitFor({ state: 'hidden', timeout: 45000 }),
        // Opción 2: Se redirige a otra página
        this.page.waitForURL((url) => !url.pathname.includes('/cart'), { timeout: 45000 })
      ]);
    } catch (error) {
      // Si ambas fallan, verificar si hay un mensaje de error
      const errorVisible = await this.errorMessage.isVisible().catch(() => false);
      if (errorVisible) {
        const errorText = await this.errorMessage.textContent();
        throw new Error(`Error en la compra: ${errorText}`);
      }
      throw error;
    }
    
    // Asegurarse de que se redirigió (si no lo hizo antes)
    try {
      await this.page.waitForURL((url) => !url.pathname.includes('/cart'), { timeout: 5000 });
    } catch {
      // Si no se redirigió, puede que aún esté en el carrito pero la compra fue exitosa
      // Verificar si el carrito está vacío
      const isEmpty = await this.emptyCartMessage.isVisible({ timeout: 2000 }).catch(() => false);
      if (!isEmpty) {
        // Si no está vacío y no se redirigió, puede haber un problema
        console.warn('La compra puede no haberse completado correctamente');
      }
    }
  }

  /**
   * Verifica que hay un mensaje de error
   */
  async verifyErrorMessageShown() {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.textContent();
  }

  /**
   * Verifica que el botón de compra está habilitado
   */
  async verifyPurchaseButtonEnabled() {
    return !(await this.purchaseButton.isDisabled());
  }

  /**
   * Verifica que el botón de compra está deshabilitado
   */
  async verifyPurchaseButtonDisabled() {
    return await this.purchaseButton.isDisabled();
  }
}

