import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersManagementComponent } from './users-management';
import { AdminService } from '../../services/admin-service/admin-service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { User } from '../../models/user.interface';

describe('UsersManagementComponent', () => {
  let component: UsersManagementComponent;
  let fixture: ComponentFixture<UsersManagementComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getAllUsers', 'updateUser', 'deleteUser']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [UsersManagementComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersManagementComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('USER-MGMT-COMP-001: should validate phone number format (8-15 digits)', () => {
    // Valid phone numbers
    expect(component.validatePhone('12345678')).toBe(true);
    expect(component.validatePhone('1234567890')).toBe(true);
    expect(component.validatePhone('123456789012345')).toBe(true);
    expect(component.phoneError()).toBeNull();
  });

  it('USER-MGMT-COMP-002: should reject phone number with less than 8 digits', () => {
    const result = component.validatePhone('1234567');
    expect(result).toBe(false);
    expect(component.phoneError()).toContain('8 y 15 dígitos');
  });

  it('USER-MGMT-COMP-003: should reject phone number with more than 15 digits', () => {
    const result = component.validatePhone('1234567890123456');
    expect(result).toBe(false);
    expect(component.phoneError()).toContain('8 y 15 dígitos');
  });

  it('USER-MGMT-COMP-004: should reject phone number with non-digit characters', () => {
    const result = component.validatePhone('123-456-7890');
    expect(result).toBe(false);
    expect(component.phoneError()).toContain('8 y 15 dígitos');
  });

  it('USER-MGMT-COMP-005: should allow empty phone number (optional field)', () => {
    expect(component.validatePhone('')).toBe(true);
    expect(component.validatePhone(undefined)).toBe(true);
    expect(component.phoneError()).toBeNull();
  });

  it('USER-MGMT-COMP-006: should populate edit form with user data including name/phone/address', () => {
    const user: User = {
      _id: '123',
      username: 'testuser',
      name: 'John Doe',
      phone: '1234567890',
      address: '123 Main St',
      role: 'user'
    };

    component.startEdit(user);

    expect(component.editingUser()).toEqual(user);
    expect(component.editForm().name).toBe('John Doe');
    expect(component.editForm().phone).toBe('1234567890');
    expect(component.editForm().address).toBe('123 Main St');
  });

  it('USER-MGMT-COMP-007: should update phone number and validate on change', () => {
    component.onPhoneChange('1234567890');
    expect(component.editForm().phone).toBe('1234567890');
    expect(component.phoneError()).toBeNull();

    component.onPhoneChange('123-456');
    expect(component.phoneError()).not.toBeNull();
  });

  it('USER-MGMT-COMP-008: should validate before saving user update', () => {
    const user: User = {
      _id: '123',
      username: 'testuser',
      role: 'user'
    };

    component.startEdit(user);
    component.editForm.set({ phone: '123' }); // Invalid phone

    component.saveUser();

    expect(adminService.updateUser).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error de validación'
      })
    );
  });
});
