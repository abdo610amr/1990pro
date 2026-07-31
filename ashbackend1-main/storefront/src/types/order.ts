export interface OrderItem {
  productId?: number | null;
  name: string;
  variant?: string;
  size: string;
  quantity: number;
  price: number;
}

export type OrderStatus = string;

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
  status: OrderStatus;
  delivered_at?: string | null;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalPrice: number;
  items: OrderItem[];
  promoCode?: string;
  discount?: number;
  promoType?: string;
  paymentMethod: string;
  screenshot?: File;
}

export interface CreateOrderResponse {
  message: string;
  orderId: number;
}
