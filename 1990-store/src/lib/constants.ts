import type { NavLink } from "@/types";

export const SITE_NAME = "1990";
export const SITE_SLOGAN = "Made for Originals";
export const SITE_MARK = "OTZ";
export const SITE_ESTABLISHED = "2026";
export const SITE_DESCRIPTION =
  "1990 is a luxury fashion destination featuring exclusive Originals and a curated selection of premium local brands.";

// ── Physical store (edit here to update it everywhere) ──
export const STORE_NAME = "1990 Flagship Store";
export const STORE_ADDRESS_LINE1 = "46 Amman Street";
export const STORE_ADDRESS_LINE2 = "Behind Shooting Club — Dokki, Cairo";
export const STORE_HOURS = "Daily · 12:00 – 22:00";
// Google Maps: link to open directions, and embed URL for the inline map.
export const STORE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=46+Amman+Street+Dokki+Cairo+Egypt";
export const STORE_MAPS_EMBED =
  "https://maps.google.com/maps?q=46%20Amman%20Street%20Dokki%20Cairo%20Egypt&z=15&output=embed";

export const NAV_LINKS: NavLink[] = [
  {
    label: "Shop",
    href: "/shop",
  },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "Shop All", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Best Sellers", href: "/shop?sort=best-selling" },
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

// Storefront currency. The business runs in Egypt (Cash on Delivery + InstaPay),
// so prices, shipping and totals are all in EGP. This must match the Odoo
// pricelist/currency used when the Sale Order is created.
export const CURRENCY = "EGP";
export const CURRENCY_LOCALE = "en-EG";

// Shipping / tax defaults.
// NOTE: once Odoo owns pricing, tax and delivery should come FROM Odoo
// (fiscal position + delivery product). TAX_RATE here is a display-only
// fallback (0 = prices are tax-inclusive) and shipping is sent to the backend
// as an explicit field so the Odoo Sale Order can add a matching delivery line.
export const SHIPPING_COST = 50;
export const EXPRESS_SHIPPING_COST = 100;
export const TAX_RATE = 0;
export const FREE_SHIPPING_THRESHOLD = 2000;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
] as const;
