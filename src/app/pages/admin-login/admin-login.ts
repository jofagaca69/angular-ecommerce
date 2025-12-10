import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StorageService } from '../../services/storage-service/storage-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLoginComponent {
  private authService: AuthService = inject(AuthService);
  private router = inject(Router);
  private messageService: MessageService = inject(MessageService);
  private storageService: StorageService = inject(StorageService);

  errorMessage = '';

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  login() {
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    const username = this.loginForm.get('username')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    const payload = {
      username,
      password,
      requireRole: 'admin' as const
    };

    this.authService.login(payload).subscribe({
      next: (resp) => {
        console.log('Admin login exitoso:', resp);
        this.storageService.set('token', resp.token);

        // Verificar si hay una ruta de retorno guardada
        const returnUrl = this.storageService.get<string>('returnUrl');

        if (returnUrl && this.isAdminRoute(returnUrl)) {
          // Limpiar la ruta de retorno y navegar allí
          this.storageService.remove('returnUrl');
          this.router.navigate([returnUrl]);
        } else {
          // Si returnUrl no es ruta admin o no existe, redirigir a dashboard
          if (returnUrl) {
            this.storageService.remove('returnUrl'); // Limpiar returnUrl no válido
          }
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error en login admin:', err);

        if (err.status === 403 || err.error?.message?.includes('admin permissions')) {
          this.errorMessage = 'No tienes permisos de administrador';
          this.messageService.add({
            severity: 'error',
            summary: 'Acceso denegado',
            detail: 'No tienes permisos de administrador',
          });
        } else if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos';
          this.messageService.add({
            severity: 'error',
            summary: 'Error de autenticación',
            detail: 'Las credenciales proporcionadas son incorrectas',
          });
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error inesperado',
          });
        }
      },
    });
  }

  /**
   * Verifica si una ruta es una ruta administrativa (seguridad)
   * @param route - Ruta a verificar
   * @returns true si es ruta admin, false en caso contrario
   */
  private isAdminRoute(route: string): boolean {
    return route.startsWith('/admin/');
  }
}
