import { Component, inject } from '@angular/core';
import { NumericKeypad } from '../../components/numeric-keypad/numeric-keypad';
import {FormGroup, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service';
import {Router} from '@angular/router';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NumericKeypad, ReactiveFormsModule],
  templateUrl: './register.html',
})
export class Register {

  private authService: AuthService = inject(AuthService);
  private router = inject(Router);
  private messageService: MessageService = inject(MessageService)


  registerForm = new FormGroup({
    phone: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  showKeypad = false;
  activeField: 'phone' | 'password' | null = null;

  PHONE_MAX = 10;
  PASS_MAX = 6;

  errorMessage = '';

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

    const control = this.registerForm.get(this.activeField)!;
    let value = control.value || '';

    if (event.type === 'digit') {
      const limit = this.activeField === 'phone' ? this.PHONE_MAX : this.PASS_MAX;
      if (value.length < limit) value += event.value!;
    }

    if (event.type === 'backspace') value = value.slice(0, -1);

    if (event.type === 'done') this.closeKeypad();

    control.setValue(value);
  }

  register() {
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    const username = this.registerForm.get('phone')?.value ?? '';
    const password = this.registerForm.get('password')?.value ?? '';

    const payload = { username, password };

    this.authService.register(payload).subscribe({
      next: (resp) => {
        this.messageService.add({ severity: 'success', summary: 'Usuario creado', detail: 'Usuario creado exitósamente, por favor inicie sesión' });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro:', err);

        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error inesperado' });
        this.errorMessage = 'Ocurrió un error inesperado.';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
