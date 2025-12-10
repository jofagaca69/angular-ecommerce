export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  inventoryValue: number;
  lowStockProducts: number;
  recentSales: number;
  period?: 'day' | 'week' | 'month';
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  categoriesCount: number;
}
