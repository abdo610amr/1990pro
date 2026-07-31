export type PromoType = "percentage" | "fixed" | "bogo" | "bundle";

export interface Promo {
  id: number;
  code: string;
  active: number | boolean;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number;
  min_order: number;
  type: PromoType;
  discount_value: number;
  bundle_buy: string | null;
  bundle_get: string | null;
  buy_qty: number | null;
  get_qty: number | null;
}

export interface PromoFormData {
  code: string;
  active: boolean;
  start_date: string;
  end_date: string;
  usage_limit: number | "";
  min_order: number;
  type: PromoType;
  discount_value: number;
  bundle_buy: string;
  bundle_get: string;
  buy_qty: number;
  get_qty: number;
}

export interface ApplyPromoResponse {
  type: PromoType;
  discount: number;
  finalPrice: number;
  promo: string;
  message: string;
}
