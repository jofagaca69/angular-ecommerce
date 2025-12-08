import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product } from "../../models/product.interface";
import { Category } from "../../models/category.interface";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ProductService {
  private http = inject(HttpClient);
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
}