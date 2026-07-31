export interface BackendVariant {
  label: string;
  price: number;
  stock: number;
  sku?: string | null;
}

export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  gallery: string[];
  categoryId: number | null;
  brandId?: number;
  productType?: "originals" | "showroom";
  variantType: string;
  variantLabel: string;
  variants: BackendVariant[];
  tags: string[];
  lowStockThreshold: number;
  stockStatus: "in_stock" | "low_stock" | "sold_out";
}

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sortOrder: number;
  active: boolean;
}

export interface BackendBrand {
  id: number;
  slug: string;
  name: string;
  logo: string;
  coverImage: string;
  story: string;
  about: string;
  categories: string[];
  followers: number;
  rating: number;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  featured: boolean;
  active: boolean;
}

export interface BackendReview {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  comment: string | null;
  createdAt?: string;
}

export interface BackendOrderItem {
  productId: number;
  name: string;
  variant: string;
  size: string;
  quantity: number;
  price: number;
}

export interface BackendOrder {
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
  status: string;
  delivered_at?: string | null;
  items: BackendOrderItem[];
}

export interface BackendUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string | null;
  addresses: Array<Record<string, unknown>>;
  wishlist: number[];
}
