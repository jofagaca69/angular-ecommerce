import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Cart } from './pages/cart/cart';
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { UsersManagementComponent } from './pages/users-management/users-management';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'cart',
    component: Cart,
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/users',
    component: UsersManagementComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/inventory',
    component: InventoryManagementComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
