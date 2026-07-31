import { api } from "./api";
import type { Category } from "@/types/product";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>("/categories");
    return data.filter((c) => c.active);
  },
};
