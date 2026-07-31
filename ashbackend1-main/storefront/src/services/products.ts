import { api } from "./api";
import type { Product } from "@/types/product";

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
};
