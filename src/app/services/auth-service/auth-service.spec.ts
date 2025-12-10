import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ADMIN-AUTH-SVC-001: should call login endpoint with requireRole when provided', () => {
    const mockResponse = { success: true, token: 'mock-token' };
    const loginData = { username: 'admin', password: 'admin123', requireRole: 'admin' };

    service.login(loginData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3003/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush(mockResponse);
  });

  it('ADMIN-AUTH-SVC-002: should call login endpoint without requireRole when not provided', () => {
    const mockResponse = { success: true, token: 'mock-token' };
    const loginData = { username: 'user', password: 'user123' };

    service.login(loginData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3003/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush(mockResponse);
  });

  it('ADMIN-AUTH-SVC-003: should handle 403 error when user does not have admin role', () => {
    const loginData = { username: 'user', password: 'user123', requireRole: 'admin' };
    const errorResponse = {
      success: false,
      message: 'User does not have admin permissions',
      userRole: 'user'
    };

    service.login(loginData).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(403);
        expect(error.error.message).toContain('admin permissions');
      }
    });

    const req = httpMock.expectOne('http://localhost:3003/auth/login');
    req.flush(errorResponse, { status: 403, statusText: 'Forbidden' });
  });
});
