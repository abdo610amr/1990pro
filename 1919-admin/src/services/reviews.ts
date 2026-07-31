import { api } from "./api";
import type { Review } from "@/types/review";

export const reviewService = {
  async getAll(): Promise<Review[]> {
    const { data } = await api.get<Review[]>("/reviews");
    return data;
  },

  async getByProduct(productId: number): Promise<Review[]> {
    const { data } = await api.get<Review[]>(`/reviews/product/${productId}`);
    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/reviews/${id}`);
    return data;
  },
};
