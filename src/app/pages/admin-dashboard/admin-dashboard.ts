import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin-service/admin-service';
import { DashboardStats } from '../../models/dashboard.interface';
import { Sale } from '../../models/sale.interface';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ToastModule, RouterModule, Navbar],
  providers: [MessageService],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

  stats = signal<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    inventoryValue: 0,
    lowStockProducts: 0,
    recentSales: 0,
  });
  
  recentSales = signal<Sale[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Cargar estadísticas del dashboard
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Información',
          detail: 'Algunas estadísticas no están disponibles',
        });
      },
    });

    // Cargar ventas recientes
    this.adminService.getAllSales(10).subscribe({
      next: (sales) => {
        this.recentSales.set(sales);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ventas recientes',
        });
        this.loading.set(false);
      },
    });
  }

  getSaleStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
