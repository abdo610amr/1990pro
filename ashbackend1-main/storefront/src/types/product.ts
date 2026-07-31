export type VariantType =
  | "perfume-volume"
  | "fashion-size"
  | "shoe-size"
  | "custom";

export type StockStatus = "in_stock" | "low_stock" | "sold_out";

export interface ProductVariant {
  label: string;
  price: number;
  stock: number;
  sku?: string | null;
}

export interface ProductSize {
  size: string;
  price: number;
  stock?: number;
  sku?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  gallery: string[];
  categoryId: number | null;
  variantType: VariantType;
  variantLabel: string;
  variants: ProductVariant[];
  sizes: ProductSize[];
  tags: string[];
  lowStockThreshold: number;
  stockStatus: StockStatus;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sortOrder: number;
  active: boolean;
}
