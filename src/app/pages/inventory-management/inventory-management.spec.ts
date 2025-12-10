import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryManagementComponent } from './inventory-management';
import { AdminService } from '../../services/admin-service/admin-service';
import { ProductService } from '../../services/product-service/product-service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';

describe('InventoryManagementComponent', () => {
  let component: InventoryManagementComponent;
  let fixture: ComponentFixture<InventoryManagementComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let productService: jasmine.SpyObj<ProductService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockProducts: Product[] = [
    { _id: '1', name: 'Product 1', price: 10, stock: 5, categories: ['cat1'] },
    { _id: '2', name: 'Product 2', price: 20, stock: 15, categories: ['cat1'] },
    { _id: '3', name: 'Product 3', price: 30, stock: 25, categories: ['cat2'] }
  ];

  const mockCategories: Category[] = [
    { _id: 'cat1', name: 'Category 1' },
    { _id: 'cat2', name: 'Category 2' }
  ];

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['updateProductStock']);
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts', 'getCategories']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [InventoryManagementComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryManagementComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('INVENTORY-COMP-001: should filter products by category', () => {
    // Arrange
    component.products.set(mockProducts);
    component.categories.set(mockCategories);

    // Act: Filter by cat1
    component.filterByCategory('cat1');

    // Assert
    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(2);
    expect(filtered.every(p => p.categories.includes('cat1'))).toBe(true);
  });

  it('INVENTORY-COMP-002: should show all products when no category selected', () => {
    // Arrange
    component.products.set(mockProducts);

    // Act
    component.filterByCategory(null);

    // Assert
    expect(component.filteredProducts().length).toBe(3);
  });

  it('INVENTORY-COMP-003: should identify low stock products (stock <= threshold)', () => {
    // Arrange
    component.products.set(mockProducts);
    component.lowStockThreshold.set(10);

    // Act
    const lowStock = component.lowStockProducts();

    // Assert
    expect(lowStock.length).toBe(1);
    expect(lowStock[0].stock).toBeLessThanOrEqual(10);
  });

  it('INVENTORY-COMP-004: should calculate total inventory value correctly', () => {
    // Arrange
    component.products.set(mockProducts);

    // Act
    const totalValue = component.totalInventoryValue();

    // Assert: (10*5) + (20*15) + (30*25) = 50 + 300 + 750 = 1100
    expect(totalValue).toBe(1100);
  });

  it('INVENTORY-COMP-005: should return correct stock status (critical, low, normal)', () => {
    expect(component.getStockStatus(0)).toBe('critical');
    expect(component.getStockStatus(5)).toBe('low'); // <= 10
    expect(component.getStockStatus(10)).toBe('low'); // <= 10
    expect(component.getStockStatus(15)).toBe('normal'); // > 10
  });

  it('INVENTORY-COMP-006: should handle error when loading products fails', () => {
    productService.getProducts.and.returnValue(throwError(() => new Error('Service error')));
    productService.getCategories.and.returnValue(of(mockCategories));

    component.loadData();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error'
      })
    );
  });
});
