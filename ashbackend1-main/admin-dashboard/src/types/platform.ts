export type ProductType = "perfume" | "fashion";

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
  variantType: "perfume-volume" | "fashion-size" | "shoe-size" | "custom";
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

export interface DemoSeedResult {
  message: string;
  productCount: number;
  categoryCount: number;
  config: PlatformConfig;
}
