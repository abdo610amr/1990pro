export interface CartItem {
  productId: number;
  name: string;
  size: string;
  price: number;
  quantity: number;
  coverImage: string;
}

export interface AppliedPromo {
  code: string;
  type: string;
  discount: number;
  finalPrice: number;
}
