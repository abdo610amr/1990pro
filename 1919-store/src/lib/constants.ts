import type { NavLink } from "@/types";

export const SITE_NAME = "1990";
export const SITE_SLOGAN = "Made for Originals";
export const SITE_MARK = "OTZ";
export const SITE_ESTABLISHED = "2026";
export const SITE_DESCRIPTION =
  "1990 is a luxury fashion destination featuring exclusive Originals and a curated selection of premium local brands.";

export const NAV_LINKS: NavLink[] = [
  {
    label: "Shop",
    href: "/shop",
  },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "Shop All", href: "/shop" },
    { label: "Originals", href: "/originals" },
    { label: "Brands", href: "/brands" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Best Sellers", href: "/shop?sort=best-selling" },
    { label: "Collections", href: "/collections" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
};

export const TRENDING_SEARCHES = [
  "Oversized Blazer",
  "Premium Hoodie",
  "Leather Jacket",
  "Minimal Sneakers",
  "Wool Coat",
  "Streetwear Essentials",
];

export const SHIPPING_COST = 15;
export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 200;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
] as const;
