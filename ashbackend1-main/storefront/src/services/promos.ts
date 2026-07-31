import { api } from "./api";
import type { CartItem } from "@/types/cart";

export interface ApplyPromoPayload {
  code: string;
  totalAmount: number;
  email?: string;
  cartItems: Pick<CartItem, "size" | "quantity" | "price">[];
}

export interface ApplyPromoResponse {
  type: string;
  discount?: number;
  finalPrice?: number;
  promo?: string;
  message: string;
  buy?: string;
  get?: string;
}

export const promoService = {
  apply: async (payload: ApplyPromoPayload): Promise<ApplyPromoResponse> => {
    const { data } = await api.post<ApplyPromoResponse>("/promo/apply", payload);
    return data;
  },
};
