import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Cart } from './pages/cart/cart';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { UsersManagementComponent } from './pages/users-management/users-management';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management';

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
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
  },
  {
    path: 'admin/users',
    component: UsersManagementComponent,
  },
  {
    path: 'admin/inventory',
    component: InventoryManagementComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
