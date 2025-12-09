import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin-service/admin-service';
import { ProductService } from '../../services/product-service/product-service';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, Navbar],
  providers: [MessageService],
  templateUrl: './inventory-management.html',
  styleUrl: './inventory-management.css',
})
export class InventoryManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private messageService = inject(MessageService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  selectedCategory = signal<string | null>(null);
  lowStockThreshold = signal<number>(10);
  editingProduct = signal<Product | null>(null);
  newStock = signal<number>(0);

  // Computed properties
  filteredProducts = computed(() => {
    const categoryId = this.selectedCategory();
    if (!categoryId) return this.products();
    return this.products().filter((p) => {
      if (Array.isArray(p.categories)) {
        return p.categories.some(cat => 
          typeof cat === 'string' ? cat === categoryId : cat._id === categoryId
        );
      }
      return false;
    });
  });

  lowStockProducts = computed(() => {
    const threshold = this.lowStockThreshold();
    return this.products().filter((p) => p.stock <= threshold);
  });

  totalInventoryValue = computed(() => {
    return this.products().reduce((sum, p) => sum + p.price * p.stock, 0);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos',
        });
        this.loading.set(false);
      },
    });

    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  filterByCategory(categoryId: string | null): void {
    this.selectedCategory.set(categoryId);
  }

  startEditStock(product: Product): void {
    this.editingProduct.set(product);
    this.newStock.set(product.stock);
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
    this.newStock.set(0);
  }

  updateStock(): void {
    const product = this.editingProduct();
    if (!product) return;

    this.adminService.updateProductStock(product._id, this.newStock()).subscribe({
      next: (updatedProduct) => {
        const updatedProducts = this.products().map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p
        );
        this.products.set(updatedProducts);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Stock actualizado correctamente',
        });
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el stock',
        });
      },
    });
  }

  getCategoryNames(product: Product): string {
    if (!Array.isArray(product.categories) || product.categories.length === 0) {
      return 'Sin categoría';
    }
    
    return product.categories
      .map(cat => {
        if (typeof cat === 'string') {
          const category = this.categories().find(c => c._id === cat);
          return category ? category.name : 'Desconocida';
        }
        return cat.name;
      })
      .join(', ');
  }

  getStockStatus(stock: number): 'critical' | 'low' | 'normal' {
    if (stock === 0) return 'critical';
    if (stock <= this.lowStockThreshold()) return 'low';
    return 'normal';
  }
}
