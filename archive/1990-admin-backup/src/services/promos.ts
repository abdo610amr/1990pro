import { api } from "./api";
import type { Promo, PromoFormData } from "@/types/promo";

export const promoService = {
  async getAll(): Promise<Promo[]> {
    const { data } = await api.get<Promo[]>("/promo");
    return data;
  },

  async create(form: PromoFormData): Promise<{ message: string }> {
    const payload = {
      code: form.code,
      active: form.active ? 1 : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      usage_limit: form.usage_limit === "" ? null : form.usage_limit,
      min_order: form.min_order,
      type: form.type,
      discount_value: form.discount_value,
      bundle_buy: form.bundle_buy || null,
      bundle_get: form.bundle_get || null,
      buy_qty: form.buy_qty,
      get_qty: form.get_qty,
    };

    const { data } = await api.post<{ message: string }>("/promo", payload);
    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/promo/${id}`);
    return data;
  },
};
