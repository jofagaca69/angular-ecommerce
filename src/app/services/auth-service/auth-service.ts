import {Component, inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3003/auth';

  login(data: { username: string; password: string; requireRole?: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, data);
  }

  register(data: { username: string;  password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  refreshToken(token: string): Observable<any> {
    return this.http.post(`${this.API_URL}/refresh`, { token });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
