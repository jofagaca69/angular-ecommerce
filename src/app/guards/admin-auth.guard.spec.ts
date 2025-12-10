import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminAuthGuard } from './admin-auth.guard';
import { StorageService } from '../services/storage-service/storage-service';
import * as jwtUtils from '../utils/jwt-utils';

describe('AdminAuthGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let storageService: jasmine.SpyObj<StorageService>;
  let isAdminOrEmployeeSpy: jasmine.Spy;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: StorageService, useValue: storageSpy }
      ],
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    
    // Spy on isAdminOrEmployee
    isAdminOrEmployeeSpy = spyOn(jwtUtils, 'isAdminOrEmployee');
  });

  it('should be created', () => {
    expect(adminAuthGuard).toBeDefined();
  });

  it('ADMIN-GUARD-UNIT-001: should allow access when token exists and user has admin role', () => {
    storageService.get.and.returnValue('valid-admin-token');
    isAdminOrEmployeeSpy.and.returnValue(true);

    const route = {} as any;
    const state = { url: '/admin/dashboard' } as any;

    const result = adminAuthGuard(route, state);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ADMIN-GUARD-UNIT-002: should redirect to /admin/login when no token exists', () => {
    storageService.get.and.returnValue(null);

    const route = {} as any;
    const state = { url: '/admin/dashboard' } as any;

    const result = adminAuthGuard(route, state);

    expect(result).toBe(false);
    expect(storageService.set).toHaveBeenCalledWith('returnUrl', '/admin/dashboard');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('ADMIN-GUARD-UNIT-003: should redirect to home when user does not have admin role', () => {
    storageService.get.and.returnValue('user-token');
    isAdminOrEmployeeSpy.and.returnValue(false);

    const route = {} as any;
    const state = { url: '/admin/dashboard' } as any;

    const result = adminAuthGuard(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('ADMIN-GUARD-UNIT-004: should save returnUrl when redirecting to login', () => {
    storageService.get.and.returnValue(null);
    const route = {} as any;
    const state = { url: '/admin/users' } as any;

    adminAuthGuard(route, state);

    expect(storageService.set).toHaveBeenCalledWith('returnUrl', '/admin/users');
  });
});
