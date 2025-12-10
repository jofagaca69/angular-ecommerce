import {Component, inject} from '@angular/core';
import { NumericKeypad } from '../../components/numeric-keypad/numeric-keypad';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth-service/auth-service';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {StorageService} from '../../services/storage-service/storage-service';
import { getRoleFromToken } from '../../utils/jwt-utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NumericKeypad, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {

  private authService: AuthService = inject(AuthService)
  private router = inject(Router);
  private messageService: MessageService = inject(MessageService)
  private storageService: StorageService = inject(StorageService)

  errorMessage = '';

  loginForm = new FormGroup({
    phone: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  showKeypad = false;
  activeField: 'phone' | 'password' | null = null;

  PHONE_MAX = 10;
  PASS_MAX = 6;

  openKeypad(field: 'phone' | 'password') {
    this.activeField = field;
    this.showKeypad = true;
  }

  closeKeypad() {
    this.showKeypad = false;
    this.activeField = null;
  }

  onKey(event: { type: 'digit' | 'backspace' | 'done'; value?: string }) {
    if (!this.activeField) return;

    const control = this.loginForm.get(this.activeField)!;
    let value = control.value || '';

    if (event.type === 'digit') {
      const limit = this.activeField === 'phone' ? this.PHONE_MAX : this.PASS_MAX;
      if (value.length < limit) {
        value += event.value!;
      }
    }

    if (event.type === 'backspace') {
      value = value.slice(0, -1);
    }

    if (event.type === 'done') {
      this.closeKeypad();
    }

    control.setValue(value);
  }

  login() {
    this.errorMessage = '';
    if (this.loginForm.invalid) return;

    const phone = this.loginForm.get('phone')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    const payload = {
      username: phone,
      password: password
    };

    this.authService.login(payload).subscribe({
      next: (resp) => {
        console.log('Login exitoso:', resp);
        this.storageService.set("token", resp.token)
        this.storageService.set("phone", this.loginForm.getRawValue().phone)
        
        // Get user role from token to determine redirect
        const token = resp.token;
        const userRole = getRoleFromToken(token);
        
        // Verificar si hay una ruta de retorno guardada
        const returnUrl = this.storageService.get<string>('returnUrl');
        
        if (returnUrl) {
          // Limpiar la ruta de retorno y navegar allí
          this.storageService.remove('returnUrl');
          this.router.navigate([returnUrl]);
        } else {
          // Redirect based on role
          if (userRole === 'admin' || userRole === 'employee') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['dashboard']);
          }
        }
      },
      error: (err) => {
        console.error('Error en registro:', err);

        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error inesperado' });
        this.errorMessage = 'Ocurrió un error inesperado.';
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
