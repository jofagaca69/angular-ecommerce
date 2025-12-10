import { Component, computed, inject, signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage-service/storage-service';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product-service/product-service';
import { MessageService } from 'primeng/api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
})
export class Cart {
  private storageService: StorageService = inject(StorageService);
  private productService: ProductService = inject(ProductService);
  private messageService: MessageService = inject(MessageService);
  private router = inject(Router);
  cartItems = this.storageService.cartItems;
  isLoading = signal(false);
  errorMessage = '';

  cartTotal = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  updateQuantity(itemId: string, newQuantity: number): void {
    const quantity = Math.max(1, newQuantity);

    const updatedItems = this.cartItems().map((item) =>
      item.id === itemId ? { ...item, quantity: quantity } : item
    );
    this.storageService.updateCart(updatedItems);
  }

  removeItem(itemId: string): void {
    const updatedItems = this.cartItems().filter((item) => item.id !== itemId);
    this.storageService.updateCart(updatedItems);
  }

  purchase() {
    this.isLoading.set(true);
    const ids: string[] = this.cartItems().reduce((acc: string[], item) => {
      for (let i = 0; i < item.quantity; i++) {
        acc.push(item.id);
      }
      return acc;
    }, []);
    this.productService.buy({ ids }).subscribe({
      next: (resp) => {
        console.log('Compra exitosa:', resp);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Compra exitosa',
        });
        this.storageService.updateCart([]);
        this.router.navigate(['home']);
      },
      error: (err) => {
        console.error('Error en compra:', err);
        this.isLoading.set(false);

        // Si el error es 401 (Unauthorized), redirigir al login
        if (err.status === 401 || err.error?.message === 'Unauthorized') {
          // Guardar la ruta actual para volver después del login
          this.storageService.set('returnUrl', '/cart');
          
          this.messageService.add({
            severity: 'warn',
            summary: 'Autenticación requerida',
            detail: 'Debes iniciar sesión para realizar la compra',
          });
          
          // Redirigir al login
          this.router.navigate(['/login']);
        } else if (err.status === 504 || err.name === 'TimeoutError') {
          // Timeout error
          const errorMessage = err.error?.message || 'La solicitud está tomando demasiado tiempo. Por favor, intenta nuevamente.';
          this.messageService.add({
            severity: 'error',
            summary: 'Tiempo de espera agotado',
            detail: errorMessage,
          });
          this.errorMessage = errorMessage;
        } else if (err.status === 503) {
          // Service Unavailable - RabbitMQ o servicio no disponible
          const errorMessage = err.error?.message || 'El servicio no está disponible en este momento. Por favor, intenta nuevamente.';
          this.messageService.add({
            severity: 'error',
            summary: 'Servicio no disponible',
            detail: errorMessage,
          });
          this.errorMessage = errorMessage;
        } else {
          // Otros errores
          const errorMessage = err.error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error en la compra',
            detail: errorMessage,
          });
          this.errorMessage = errorMessage;
        }
      },
    });
  }
}
