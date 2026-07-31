import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, ProductVariant } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants?.length) return product.variants;
  return (product.sizes ?? []).map((s) => ({
    label: s.size,
    price: s.price,
    stock: s.stock ?? 0,
    sku: s.sku,
  }));
}

export function getLowestPrice(product: Product): number {
  const variants = getProductVariants(product);
  if (!variants.length) return 0;
  return Math.min(...variants.map((s) => s.price));
}

export function getHighestPrice(product: Product): number {
  const variants = getProductVariants(product);
  if (!variants.length) return 0;
  return Math.max(...variants.map((s) => s.price));
}

export function isVariantAvailable(product: Product, label: string): boolean {
  const variant = getProductVariants(product).find(
    (v) => v.label.toLowerCase() === label.toLowerCase()
  );
  return (variant?.stock ?? 0) > 0;
}

export function getMaxQuantity(product: Product, label: string): number {
  const variant = getProductVariants(product).find(
    (v) => v.label.toLowerCase() === label.toLowerCase()
  );
  return variant?.stock ?? 0;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function extractUniqueTags(products: Product[]): string[] {
  const tags = new Set<string>();
  for (const product of products) {
    for (const tag of product.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function extractAvailableSizes(products: Product[]): string[] {
  const sizes = new Set<string>();
  for (const product of products) {
    for (const variant of getProductVariants(product)) {
      if (variant.label) sizes.add(variant.label);
    }
  }

  const order = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  return Array.from(sizes).sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function productHasSize(product: Product, size: string): boolean {
  return getProductVariants(product).some(
    (variant) => variant.label.toLowerCase() === size.toLowerCase() && variant.stock > 0
  );
}
