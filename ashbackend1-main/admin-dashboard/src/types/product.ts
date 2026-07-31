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

/** @deprecated use ProductVariant — kept for API backward compatibility */
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

export interface ProductFormData {
  name: string;
  description: string;
  categoryId: number | null;
  variantType: VariantType;
  variantLabel: string;
  variants: ProductVariant[];
  tags: string[];
  lowStockThreshold: number;
  cover?: File;
  gallery?: File[];
}

export const VARIANT_TYPE_OPTIONS: {
  value: VariantType;
  label: string;
  defaultLabel: string;
  presets: string[];
}[] = [
  {
    value: "perfume-volume",
    label: "Perfume Volume",
    defaultLabel: "Volume",
    presets: ["30ml", "50ml", "100ml"],
  },
  {
    value: "fashion-size",
    label: "Fashion Size",
    defaultLabel: "Size",
    presets: ["S", "M", "L", "XL", "XXL"],
  },
  {
    value: "shoe-size",
    label: "Shoe Size",
    defaultLabel: "Shoe Size",
    presets: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  },
  {
    value: "custom",
    label: "Custom",
    defaultLabel: "Option",
    presets: [],
  },
];
