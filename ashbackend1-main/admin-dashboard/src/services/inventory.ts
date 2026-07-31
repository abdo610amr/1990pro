import { api } from "./api";
import type { InventoryItem } from "@/types/inventory";
import type { ProductVariant } from "@/types/product";

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const { data } = await api.get<InventoryItem[]>("/products/inventory");
    return data;
  },

  async updateStock(
    productId: number,
    variants: ProductVariant[],
    lowStockThreshold?: number
  ): Promise<{ message: string }> {
    const { data } = await api.patch<{ message: string }>(
      `/products/${productId}/inventory`,
      { variants, lowStockThreshold }
    );
    return data;
  },
};
