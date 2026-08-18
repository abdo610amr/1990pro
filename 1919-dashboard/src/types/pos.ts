export interface PosVariant {
  label: string;
  price: number;
  stock: number;
  sku?: string | null;
}

export interface PosProduct {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  categoryId: number | null;
  brandId?: number | null;
  brand_id?: number | null;
  brandName?: string;
  brand_name?: string;
  brandLogo?: string;
  barcode?: string;
  commissionPercentage?: number;
  productType?: string;
  variantType?: string;
  variantLabel?: string;
  lowStockThreshold?: number;
  variants: PosVariant[];
  stockStatus?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface PosCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface PosBrand {
  id: number;
  slug: string;
  name: string;
  logo?: string;
  coverImage?: string;
  barcodePrefix?: string;
  commissionPercentage?: number;
  status?: "active" | "disabled";
  description?: string;
  story?: string;
  about?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  productCount?: number;
  featured?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PosBrandAnalytics {
  summary: {
    total_brands: number;
    active_brands: number;
    total_revenue: number;
    total_commission: number;
  };
  top_selling_brands: Record<string, unknown>[];
  lowest_selling_brands: Record<string, unknown>[];
  brands: Record<string, unknown>[];
}

export interface PosBrandReport {
  brand_id: number;
  brand_name: string;
  slug: string;
  logo: string;
  barcode_prefix: string;
  status: string;
  products_count: number;
  total_orders: number;
  units_sold: number;
  total_revenue: number;
  average_order_value: number;
  commission_percentage: number;
  commission_amount: number;
  best_selling_products: Array<{
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
  }>;
}

export interface PosCartItem {
  key: string;
  productId: number;
  name: string;
  image: string;
  variant: string;
  size: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  sku?: string | null;
  discount: number;
}

export interface PosOrderItem {
  productId?: number | null;
  name: string;
  variant?: string;
  size: string;
  quantity: number;
  price: number;
  brand_id?: number | null;
  brandId?: number | null;
  brand_name?: string;
  brandName?: string;
  brand_logo?: string;
  brandLogo?: string;
  barcode?: string;
}

export interface PosOrder {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalPrice: number;
  promoCode: string | null;
  discount: number;
  promoType: string | null;
  paymentScreenshot: string | null;
  payment_method: string;
  source?: string;
  status: string;
  seller_id?: number | null;
  seller_name?: string | null;
  delivered_at?: string | null;
  createdAt?: string;
  items: PosOrderItem[];
}

export interface PosUser {
  id: number;
  full_name?: string;
  username?: string;
  email: string;
  role?: "admin" | "seller" | string;
  status?: "active" | "disabled" | string;
  max_discount?: number;
  monthly_target?: number;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string | null;
  addresses?: unknown[];
  wishlist?: number[];
}

export interface SellerPerformance {
  seller_id: number;
  seller_name: string;
  username: string;
  status: string;
  max_discount: number;
  invoice_count: number;
  total_sales: number;
  average_invoice: number;
  total_discount: number;
  today_sales: number;
  monthly_sales: number;
  monthly_target: number;
  target_progress: number;
  rank?: number;
  brand_breakdown?: Array<{
    brand_id: number;
    brand_name: string;
    brand_logo: string;
    sales_count: number;
    items_count: number;
    revenue: number;
  }>;
}

export interface PosStats {
  totalOrders: number;
  totalRevenue: number;
  monthlySales?: number;
  totalDiscounts?: number;
  totalProducts: number;
  totalCustomers?: number;
  totalSellers?: number;
  totalReviews: number;
  pendingOrders: number;
  preparingOrders?: number;
  readyOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  returnedOrders?: number;
  todaySales?: number;
  todayRevenue?: number;
  lowStockProducts: number;
  soldOutProducts: number;
  lowStockProductsList?: Array<{
    id: number;
    name: string;
    brandName: string;
    stockStatus: string;
    totalStock: number;
  }>;
  statusBreakdown: Record<string, number>;
  topBrand?: { id: number; name: string; revenue: number; orders: number } | null;
  salesByBrand?: Array<{ id: number; name: string; revenue: number; orders: number }>;
  salesOverTime?: Array<{ date: string; sales: number; revenue: number; orders: number }>;
  recentOrders?: Array<{
    id: number;
    customerName: string;
    email: string;
    totalPrice: number;
    status: string;
    source: string;
    payment_method: string;
    createdAt: string;
    itemCount: number;
  }>;
  topSellers?: {
    topSeller: SellerPerformance | null;
    lowestSeller: SellerPerformance | null;
    rankings: SellerPerformance[];
  };
}

export interface SuspendedSale {
  id: string;
  createdAt: string;
  cashierName: string;
  items: PosCartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  promoCode: string;
  discount: number;
  note?: string;
}

export interface LocalReturn {
  id: string;
  orderId: number;
  type: "full" | "partial" | "exchange";
  refundMethod: "refund" | "store_credit";
  amount: number;
  items: { name: string; quantity: number; price: number }[];
  note: string;
  createdAt: string;
  cashierName: string;
  synced: boolean;
}

export interface ShiftSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  cashierName: string;
  role: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  difference?: number;
  salesCount: number;
  salesTotal: number;
  cashSales: number;
  cardSales: number;
  instapaySales: number;
  notes?: string;
}

export interface OfflineQueuedOrder {
  id: string;
  createdAt: string;
  payload: Record<string, unknown>;
  status: "queued" | "syncing" | "failed" | "synced";
  error?: string;
}
