export type ProductType = "originals" | "brand";

export type SortOption =
  | "newest"
  | "best-selling"
  | "price-asc"
  | "price-desc"
  | "popularity";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  label: string;
  inStock: boolean;
  stock?: number;
  price?: number;
  sku?: string;
  /** available | low_stock | out_of_stock */
  availability?: "available" | "low_stock" | "out_of_stock";
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  collection?: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  type: ProductType;
  colors: ProductColor[];
  sizes: ProductSize[];
  fabric: string;
  tags: string[];
  inStock: boolean;
  lowStockThreshold?: number;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  createdAt: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  coverImage: string;
  story: string;
  about: string;
  description?: string;
  barcodePrefix?: string;
  commissionPercentage?: number;
  status?: string;
  productCount?: number;
  categories: string[];
  followers: number;
  rating: number;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  featured: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productIds: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  name?: string;
  image?: string;
  unitPrice?: number;
}

export interface WishlistItem {
  productId: string;
}

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "in-stock" | "all";
  collection?: string;
  type?: ProductType;
  sort?: SortOption;
  search?: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}
