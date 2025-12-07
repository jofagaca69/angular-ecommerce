import { Component, computed, inject } from '@angular/core';
import { StorageService } from '../../services/storage-service/storage-service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private storageService = inject(StorageService);
  private router = inject(Router);

  dropdownOpen = false;

  get isLoggedIn(): boolean {
    return !!this.storageService.get<string>('token');
  }

  cartItemCount = computed(() => {
    return this.storageService.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  get showCartCount(): boolean {
    return this.cartItemCount() > 0;
  }

  logout() {
    this.storageService.remove('token');
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
