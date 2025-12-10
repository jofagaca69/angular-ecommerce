import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard';
import { AdminService } from '../../services/admin-service/admin-service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { DashboardStats } from '../../models/dashboard.interface';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getDashboardStats', 'getAllSales']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('DASHBOARD-COMP-001: should load dashboard data on init', () => {
    const mockStats: DashboardStats = {
      totalSales: 100,
      totalRevenue: 50000,
      inventoryValue: 125000,
      lowStockProducts: 5,
      recentSales: 25,
      period: 'day'
    };

    adminService.getDashboardStats.and.returnValue(of(mockStats));
    adminService.getAllSales.and.returnValue(of([]));

    component.ngOnInit();

    expect(adminService.getDashboardStats).toHaveBeenCalledWith('day');
    expect(component.stats().totalSales).toBe(100);
  });

  it('DASHBOARD-COMP-002: should change period and reload data', () => {
    const mockStats: DashboardStats = {
      totalSales: 100,
      totalRevenue: 50000,
      inventoryValue: 125000,
      lowStockProducts: 5,
      recentSales: 30,
      period: 'week'
    };

    adminService.getDashboardStats.and.returnValue(of(mockStats));
    adminService.getAllSales.and.returnValue(of([]));

    component.onPeriodChange('week');

    expect(component.selectedPeriod()).toBe('week');
    expect(adminService.getDashboardStats).toHaveBeenCalledWith('week');
  });

  it('DASHBOARD-COMP-003: should handle error when loading dashboard stats', () => {
    adminService.getDashboardStats.and.returnValue(throwError(() => new Error('Service error')));
    adminService.getAllSales.and.returnValue(of([]));

    component.loadDashboardData();

    expect(messageService.add).toHaveBeenCalled();
    expect(component.stats().totalSales).toBe(0);
    expect(component.stats().period).toBe('day');
  });

  it('DASHBOARD-COMP-004: should display zero values when no data exists', () => {
    const mockStats: DashboardStats = {
      totalSales: 0,
      totalRevenue: 0,
      inventoryValue: 0,
      lowStockProducts: 0,
      recentSales: 0,
      period: 'day'
    };

    adminService.getDashboardStats.and.returnValue(of(mockStats));
    adminService.getAllSales.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.stats().totalSales).toBe(0);
    expect(component.stats().totalRevenue).toBe(0);
    expect(component.stats().inventoryValue).toBe(0);
  });
});
