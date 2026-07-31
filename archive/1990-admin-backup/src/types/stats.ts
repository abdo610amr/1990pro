export interface StoreStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalReviews: number;
  pendingOrders: number;
  lowStockProducts: number;
  soldOutProducts: number;
  statusBreakdown: Record<string, number>;
}
