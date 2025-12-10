import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminLoginComponent } from './admin-login';
import { AuthService } from '../../services/auth-service/auth-service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StorageService } from '../../services/storage-service/storage-service';
import { of, throwError } from 'rxjs';

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let messageService: jasmine.SpyObj<MessageService>;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get', 'remove']);

    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ADMIN-LOGIN-UNIT-001: should validate form fields (username and password required)', () => {
    expect(component.loginForm.valid).toBe(false);
    
    component.loginForm.patchValue({ username: 'admin', password: 'password123' });
    expect(component.loginForm.valid).toBe(true);
    
    component.loginForm.patchValue({ username: '', password: 'password123' });
    expect(component.loginForm.valid).toBe(false);
    
    component.loginForm.patchValue({ username: 'admin', password: '' });
    expect(component.loginForm.valid).toBe(false);
  });

  it('ADMIN-LOGIN-UNIT-002: should call authService.login with requireRole admin on submit', () => {
    const mockResponse = { success: true, token: 'mock-token' };
    authService.login.and.returnValue(of(mockResponse));
    storageService.get.and.returnValue(null);

    component.loginForm.patchValue({ username: 'admin', password: 'admin123' });
    component.login();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123',
      requireRole: 'admin'
    });
  });

  it('ADMIN-LOGIN-UNIT-003: should store token and redirect to /admin/dashboard on successful login', () => {
    const mockResponse = { success: true, token: 'mock-admin-token' };
    authService.login.and.returnValue(of(mockResponse));
    storageService.get.and.returnValue(null);

    component.loginForm.patchValue({ username: 'admin', password: 'admin123' });
    component.login();

    expect(storageService.set).toHaveBeenCalledWith('token', 'mock-admin-token');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('ADMIN-LOGIN-UNIT-004: should show error message when user does not have admin role', () => {
    const errorResponse = {
      status: 403,
      error: { message: 'User does not have admin permissions', userRole: 'user' }
    };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({ username: 'user', password: 'user123' });
    component.login();

    expect(component.errorMessage).toContain('No tienes permisos de administrador');
    expect(messageService.add).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ADMIN-LOGIN-UNIT-005: should show error message for invalid credentials', () => {
    const errorResponse = {
      status: 401,
      error: { message: 'Invalid username or password' }
    };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({ username: 'admin', password: 'wrong' });
    component.login();

    expect(component.errorMessage).toContain('Credenciales inválidas');
    expect(messageService.add).toHaveBeenCalled();
  });

  it('ADMIN-LOGIN-UNIT-006: should redirect to returnUrl if exists and is admin route', () => {
    const mockResponse = { success: true, token: 'mock-token' };
    authService.login.and.returnValue(of(mockResponse));
    storageService.get.and.returnValue('/admin/users');

    component.loginForm.patchValue({ username: 'admin', password: 'admin123' });
    component.login();

    expect(storageService.remove).toHaveBeenCalledWith('returnUrl');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
  });

  it('ADMIN-LOGIN-UNIT-007: should redirect to dashboard if returnUrl is not admin route (security)', () => {
    const mockResponse = { success: true, token: 'mock-token' };
    authService.login.and.returnValue(of(mockResponse));
    storageService.get.and.returnValue('/home'); // Non-admin route

    component.loginForm.patchValue({ username: 'admin', password: 'admin123' });
    component.login();

    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(storageService.remove).toHaveBeenCalledWith('returnUrl');
  });
});
