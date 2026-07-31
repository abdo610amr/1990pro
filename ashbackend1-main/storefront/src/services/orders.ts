import { api } from "./api";
import type { CreateOrderPayload, CreateOrderResponse, Order } from "@/types/order";

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>("/orders");
    return data;
  },

  create: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const formData = new FormData();
    formData.append("customerName", payload.customerName);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("address", payload.address);
    formData.append("totalPrice", String(payload.totalPrice));
    formData.append("items", JSON.stringify(payload.items));
    formData.append("paymentMethod", payload.paymentMethod);

    if (payload.promoCode) formData.append("promoCode", payload.promoCode);
    if (payload.discount !== undefined) formData.append("discount", String(payload.discount));
    if (payload.promoType) formData.append("promoType", payload.promoType);
    if (payload.screenshot) formData.append("screenshot", payload.screenshot);

    const { data } = await api.post<CreateOrderResponse>("/orders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  track: async (orderNumber: number, phone: string): Promise<Order | null> => {
    const { data } = await api.get<Order[]>("/orders");
    const normalizedPhone = phone.replace(/\D/g, "");
    const order = data.find(
      (o) =>
        o.id === orderNumber &&
        o.phone.replace(/\D/g, "") === normalizedPhone
    );
    return order ?? null;
  },
};
