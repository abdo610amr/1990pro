import { api } from "./api";
import type { Order, OrderStatus } from "@/types/order";

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data } = await api.get<Order[]>("/orders");
    return data;
  },

  async updateStatus(
    id: number,
    status: OrderStatus
  ): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(`/orders/${id}`, {
      status,
    });
    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/orders/${id}`);
    return data;
  },
};
