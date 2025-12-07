import { Injectable, signal, WritableSignal } from '@angular/core';
import { CartItem } from '../../pages/cart/cart';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private prefix = 'app_';
  private cartItemsSignal: WritableSignal<CartItem[]> = signal(this.loadCartFromStorage());
  readonly cartItems = this.cartItemsSignal.asReadonly();

  addProductToCart(id: string, name: string, price: number): void {
    this.cartItemsSignal.update((items) => {
      const existingItem = items.find((item) => item.id === id);

      if (existingItem) {
        return items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const newItem: CartItem = { id, name, price, quantity: 1 };
        return [...items, newItem];
      }
    });

    this.saveCartToStorage();
  }

  private loadCartFromStorage(): CartItem[] {
    const data = localStorage.getItem('cart');
    return data ? (JSON.parse(data) as CartItem[]) : [];
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItemsSignal()));
  }

  updateCart(newItems: CartItem[]): void {
    this.cartItemsSignal.set(newItems);
    this.saveCartToStorage();
  }

  set(key: string, value: any): void {
    try {
      const storageKey = this.prefix + key;

      const data = typeof value === 'string' ? value : JSON.stringify(value);

      localStorage.setItem(storageKey, data);
    } catch (e) {
      console.error('Error guardando en storage', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      const storageKey = this.prefix + key;
      const item = localStorage.getItem(storageKey);

      if (!item) return null;

      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (e) {
      console.error('Error leyendo storage', e);
      return null;
    }
  }

  remove(key: string): void {
    const storageKey = this.prefix + key;
    localStorage.removeItem(storageKey);
  }

  clear(): void {
    localStorage.clear();
  }
}
