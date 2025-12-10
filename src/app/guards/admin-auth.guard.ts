import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { StorageService } from '../services/storage-service/storage-service';
import { isAdminOrEmployee } from '../utils/jwt-utils';

/**
 * Guard to protect admin routes
 * Verifies that user is authenticated and has admin or employee role
 */
export const adminAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const router = inject(Router);
  const storageService = inject(StorageService);

  // Get token from storage
  const token = storageService.get<string>('token');

  // If no token, redirect to admin login
  if (!token) {
    console.log('[AdminAuthGuard] No token found, redirecting to login');
    storageService.set('returnUrl', state.url);
    router.navigate(['/admin/login']);
    return false;
  }

  // Check if user has admin or employee role
  try {
    if (!isAdminOrEmployee(token)) {
      console.log('[AdminAuthGuard] User does not have admin/employee role, redirecting to home');
      router.navigate(['/home']);
      return false;
    }
  } catch (error) {
    console.error('[AdminAuthGuard] Error decoding JWT token:', error);
    storageService.set('returnUrl', state.url);
    router.navigate(['/admin/login']);
    return false;
  }

  // User is authenticated and has admin/employee role
  console.log('[AdminAuthGuard] Access granted');
  return true;
};
