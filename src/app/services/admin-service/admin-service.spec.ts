import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin-service';
import { DashboardStats } from '../../models/dashboard.interface';
import { environment } from '../../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('DASHBOARD-SVC-001: should get dashboard stats with default period (day)', () => {
    const mockStats: DashboardStats = {
      totalSales: 100,
      totalRevenue: 50000,
      inventoryValue: 125000,
      lowStockProducts: 5,
      recentSales: 25,
      period: 'day'
    };

    service.getDashboardStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/api/dashboard/stats?period=day`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockStats);
  });

  it('DASHBOARD-SVC-002: should get dashboard stats with week period', () => {
    const mockStats: DashboardStats = {
      totalSales: 100,
      totalRevenue: 50000,
      inventoryValue: 125000,
      lowStockProducts: 5,
      recentSales: 30,
      period: 'week'
    };

    service.getDashboardStats('week').subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/api/dashboard/stats?period=week`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('DASHBOARD-SVC-003: should get dashboard stats with month period', () => {
    const mockStats: DashboardStats = {
      totalSales: 100,
      totalRevenue: 50000,
      inventoryValue: 125000,
      lowStockProducts: 5,
      recentSales: 50,
      period: 'month'
    };

    service.getDashboardStats('month').subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/api/dashboard/stats?period=month`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });
});
