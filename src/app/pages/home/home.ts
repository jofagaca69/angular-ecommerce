import { Component, inject, OnInit, signal } from '@angular/core';
import {Navbar} from '../../components/navbar/navbar';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { ProductService } from '../../services/product-service/product-service';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<string | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar productos');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  filterByCategory(categoryId: string | null): void {
    this.selectedCategory.set(categoryId);
    this.loading.set(true);

    if (categoryId) {
      this.productService.getProductsByCategory(categoryId).subscribe({
        next: (data) => {
          this.products.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error al filtrar productos');
          this.loading.set(false);
        }
      });
    } else {
      this.loadProducts();
    }
  }
}
