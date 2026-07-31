import type { ProductVariant, StockStatus } from "@/types/product";

export interface InventoryItem {
  id: number;
  name: string;
  coverImage: string;
  categoryId: number | null;
  variants: ProductVariant[];
  lowStockThreshold: number;
  stockStatus: StockStatus;
  totalStock: number;
}
