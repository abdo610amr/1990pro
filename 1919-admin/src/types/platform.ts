import type { VariantType } from "@/types/product";

export type ProductType = "fashion";

export type HomeSection =
  | "hero"
  | "featured"
  | "categories"
  | "newArrivals"
  | "promo"
  | "newCollection"
  | "bestSellers"
  | "newsletter";

export interface PlatformConfig {
  productType: ProductType;
  label: string;
  variantType: VariantType;
  variantLabel: string;
  variantPresets: string[];
  shopSubtitle: string;
  heroFallback: {
    title: string;
    subtitle: string;
    cta: string;
  };
  homeSections: HomeSection[];
  enableSizeFilter: boolean;
}
