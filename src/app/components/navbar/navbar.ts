import {Component, inject} from '@angular/core';
import {StorageService} from '../../services/storage-service/storage-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
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

  logout() {
    this.storageService.remove('token');
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
