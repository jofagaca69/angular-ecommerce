import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateUserRequest } from '../../models/user.interface';
import { Sale } from '../../models/sale.interface';
import { DashboardStats } from '../../models/dashboard.interface';
import { Product } from '../../models/product.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Gestión de Usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/auth/users`, {
      headers: this.getAuthHeaders(),
    });
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUser(userId: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/auth/users/${userId}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Gestión de Inventario
  getInventoryStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/api/inventory/stats`, {
      headers: this.getAuthHeaders(),
    });
  }

  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/products/api/inventory/low-stock?threshold=${threshold}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  updateProductStock(productId: string, stock: number): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiUrl}/products/api/products/${productId}/stock`,
      { stock },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Gestión de Ventas y Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/orders/api/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllSales(limit: number = 100): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/orders/api/orders?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getSalesByDateRange(startDate: string, endDate: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(
      `${this.apiUrl}/orders/api/orders/range?start=${startDate}&end=${endDate}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}
