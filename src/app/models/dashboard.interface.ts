export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  inventoryValue: number;
  lowStockProducts: number;
  recentSales: number;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  categoriesCount: number;
}
