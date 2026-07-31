export interface OrderItem {
  productId?: number | null;
  name: string;
  variant?: string;
  size: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "prepared"
  | "shipped"
  | "delivered"
  | "cancelled";

export function normalizeOrderStatus(status: string): OrderStatus {
  const key = status.trim().toLowerCase();
  const aliases: Record<string, OrderStatus> = {
    processing: "confirmed",
    done: "delivered",
    canceled: "cancelled",
  };
  return aliases[key] ?? (key as OrderStatus);
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "prepared", label: "Prepared" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export interface Order {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalPrice: number;
  promoCode: string | null;
  discount: number;
  promoType: string | null;
  paymentScreenshot: string | null;
  payment_method: string;
  status: OrderStatus | string;
  delivered_at?: string | null;
  items: OrderItem[];
}
