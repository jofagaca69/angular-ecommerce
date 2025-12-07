import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../storage-service/storage-service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private storageService: StorageService = inject(StorageService);

  private readonly API_URL = 'http://localhost:3003/products/api/products';

  buy(data: { ids: string[] }): Observable<any> {
    const token = this.storageService.get('token') as string | undefined;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.API_URL}/buy`, data, { headers: headers });
  }
}
