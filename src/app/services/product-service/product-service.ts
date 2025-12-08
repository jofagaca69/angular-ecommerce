import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product } from "../../models/product.interface";
import { Category } from "../../models/category.interface";
import { environment } from "../../../environments/environment";
import { StorageService } from "../storage-service/storage-service";

@Injectable({
  providedIn: "root"
})
export class ProductService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private apiUrl = `${environment.apiUrl}/products/api`;

  /**
   * Obtiene todos los productos
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  /**
   * Obtiene un producto por ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  /**
   * Obtiene productos filtrados por categoría
   */
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?category=${categoryId}`);
  }

  /**
   * Obtiene todas las categorías
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Realiza la compra de productos
   */
  buy(data: { ids: string[] }): Observable<any> {
    const token = this.storageService.get('token') as string | undefined;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.apiUrl}/products/buy`, data, { headers });
  }
}
