import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página Home
 */
export class HomePage {
  readonly page: Page;
  readonly productsGrid: Locator;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;
  readonly categoryButtons: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsGrid = page.locator('.grid.grid-cols-1');
    this.productCards = page.locator('article.bg-white.rounded-xl');
    this.addToCartButtons = page.locator('button:has-text("Agregar al carrito")');
    this.categoryButtons = page.locator('button:has-text("Todos"), button').filter({ hasText: /Categoría|Todos/ });
    this.loadingIndicator = page.locator('text=Cargando productos...');
    this.errorMessage = page.locator('.bg-red-100');
  }

  /**
   * Navega a la página home
   */
  async goto() {
    await this.page.goto('/home');
  }

  /**
   * Espera a que los productos se carguen
   */
  async waitForProductsLoaded() {
    // Esperar a que desaparezca el indicador de carga (si existe)
    try {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Si no hay indicador de carga, continuar
    }
    
    // Esperar a que aparezcan los productos o el mensaje de "no hay productos"
    try {
      await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      // Verificar si hay mensaje de "no hay productos"
      const noProductsMessage = this.page.locator('text=No hay productos disponibles');
      const hasNoProducts = await noProductsMessage.isVisible().catch(() => false);
      if (hasNoProducts) {
        throw new Error('No hay productos disponibles en la página');
      }
      throw new Error('No se pudieron cargar los productos');
    }
  }

  /**
   * Obtiene el primer producto disponible (con stock)
   */
  async getFirstAvailableProduct() {
    await this.waitForProductsLoaded();
    
    // Buscar un producto con stock > 0
    const productCount = await this.productCards.count();
    
    if (productCount === 0) {
      throw new Error('No hay productos disponibles en la página');
    }
    
    for (let i = 0; i < productCount; i++) {
      const productCard = this.productCards.nth(i);
      
      // Verificar que el card es visible
      const isVisible = await productCard.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      // Buscar el texto de stock
      const stockLocator = productCard.locator('text=/Stock:/');
      const stockVisible = await stockLocator.isVisible().catch(() => false);
      
      if (stockVisible) {
        const stockText = await stockLocator.textContent().catch(() => '');
        const stockMatch = stockText?.match(/Stock:\s*(\d+)/);
        
        if (stockMatch) {
          const stock = parseInt(stockMatch[1]);
          if (stock > 0) {
            const name = await productCard.locator('h3').textContent().catch(() => '');
            const price = await productCard.locator('.text-xl.font-bold').textContent().catch(() => '');
            
            return {
              card: productCard,
              name: name?.trim() || '',
              price: price?.trim() || '',
              index: i,
            };
          }
        }
      } else {
        // Si no hay texto de stock visible, asumir que tiene stock si el botón está habilitado
        const addButton = productCard.locator('button:has-text("Agregar al carrito")');
        const isDisabled = await addButton.isDisabled().catch(() => true);
        
        if (!isDisabled) {
          const name = await productCard.locator('h3').textContent().catch(() => '');
          const price = await productCard.locator('.text-xl.font-bold').textContent().catch(() => '');
          
          return {
            card: productCard,
            name: name?.trim() || '',
            price: price?.trim() || '',
            index: i,
          };
        }
      }
    }
    
    throw new Error('No se encontró ningún producto con stock disponible');
  }

  /**
   * Agrega el primer producto disponible al carrito
   */
  async addFirstProductToCart() {
    const product = await this.getFirstAvailableProduct();
    const addButton = product.card.locator('button:has-text("Agregar al carrito")');
    
    await addButton.click();
    
    // Esperar un momento para que se actualice el carrito
    await this.page.waitForTimeout(500);
    
    return {
      name: product.name,
      price: product.price,
    };
  }

  /**
   * Agrega un producto específico al carrito por índice
   */
  async addProductToCartByIndex(index: number) {
    await this.waitForProductsLoaded();
    const productCard = this.productCards.nth(index);
    const addButton = productCard.locator('button:has-text("Agregar al carrito")');
    
    // Verificar que el botón no esté deshabilitado
    const isDisabled = await addButton.isDisabled();
    if (isDisabled) {
      throw new Error(`El producto en el índice ${index} no está disponible (sin stock)`);
    }
    
    const name = await productCard.locator('h3').textContent();
    const price = await productCard.locator('.text-xl.font-bold').textContent();
    
    await addButton.click();
    await this.page.waitForTimeout(500);
    
    return { name, price };
  }

  /**
   * Filtra productos por categoría
   */
  async filterByCategory(categoryName: string) {
    if (categoryName === 'Todos') {
      await this.page.locator('button:has-text("Todos")').click();
    } else {
      await this.page.locator(`button:has-text("${categoryName}")`).click();
    }
    await this.waitForProductsLoaded();
  }

  /**
   * Verifica que hay productos disponibles
   */
  async verifyProductsLoaded() {
    await this.waitForProductsLoaded();
    const count = await this.productCards.count();
    return count > 0;
  }

  /**
   * Navega al carrito
   */
  async goToCart() {
    // Buscar el enlace o botón del carrito en el navbar
    // Asumiendo que hay un enlace en el navbar
    await this.page.locator('a[href*="cart"], button:has-text("Carrito")').first().click();
    // O navegar directamente
    await this.page.goto('/cart');
  }
}

