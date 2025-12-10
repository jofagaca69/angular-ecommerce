import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, timeout, catchError, throwError } from "rxjs";
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
    
    // Agregar timeout de 35 segundos (5 segundos más que el backend)
    return this.http.post(`${this.apiUrl}/products/buy`, data, { headers })
      .pipe(
        timeout(35000), // 35 segundos timeout
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            return throwError(() => ({
              status: 504,
              error: { message: 'La solicitud está tomando demasiado tiempo. Por favor, intenta nuevamente.' }
            }));
          }
          return throwError(() => error);
        })
      );
  }
}
