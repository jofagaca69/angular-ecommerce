import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private prefix = 'app_';

  set(key: string, value: any): void {
    try {
      const storageKey = this.prefix + key;

      const data =
        typeof value === 'string'
          ? value
          : JSON.stringify(value);

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
