import { api } from "./api";
import type { Category, CategoryFormData } from "@/types/category";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  },

  async getById(id: number): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  async create(form: CategoryFormData): Promise<Category> {
    const { data } = await api.post<Category>("/categories", form);
    return data;
  },

  async update(id: number, form: Partial<CategoryFormData>): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, form);
    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/categories/${id}`);
    return data;
  },
};
