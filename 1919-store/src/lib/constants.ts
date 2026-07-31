import type { NavLink } from "@/types";

export const SITE_NAME = "1990";
export const SITE_SLOGAN = "Made for Originals";
export const SITE_MARK = "OTZ";
export const SITE_ESTABLISHED = "2026";
export const SITE_DESCRIPTION =
  "1990 is a luxury fashion destination featuring exclusive Originals and a curated Showroom of premium local brands.";

export const NAV_LINKS: NavLink[] = [
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "Originals", href: "/shop?tab=originals" },
      { label: "Showroom", href: "/shop?tab=showroom" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Best Sellers", href: "/shop?sort=best-selling" },
    ],
  },
  {
    label: "Originals",
    href: "/originals",
  },
  {
    label: "Showroom",
    href: "/showroom",
    children: [
      { label: "All Brands", href: "/showroom" },
      { label: "Featured Brands", href: "/brands" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
  },
  {
    label: "Brands",
    href: "/brands",
  },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "Originals", href: "/originals" },
    { label: "Showroom", href: "/showroom" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Best Sellers", href: "/shop?sort=best-selling" },
    { label: "Collections", href: "/collections" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "Orders", href: "/account/orders" },
    { label: "Wishlist", href: "/account/wishlist" },
    { label: "Addresses", href: "/account/addresses" },
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
