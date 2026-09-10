/**
 * Persist ERP-only fields through the existing `tags` array
 * without changing backend APIs.
 */

export interface ProductMeta {
  slug?: string;
  salePrice?: number;
  cost?: number;
  barcode?: string;
  weight?: number;
  featured?: boolean;
  status?: "active" | "draft" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  location?: string;
}

const META_PREFIX = "__meta:";

export function parseProductMeta(tags: string[] | undefined | null): {
  tags: string[];
  meta: ProductMeta;
} {
  const list = Array.isArray(tags) ? tags : [];
  const metaTag = list.find((tag) => String(tag).startsWith(META_PREFIX));
  const cleanTags = list.filter((tag) => !String(tag).startsWith(META_PREFIX));
  if (!metaTag) return { tags: cleanTags, meta: { status: "active", featured: false } };
  try {
    const meta = JSON.parse(String(metaTag).slice(META_PREFIX.length)) as ProductMeta;
    return {
      tags: cleanTags,
      meta: {
        status: "active",
        featured: false,
        ...meta,
      },
    };
  } catch {
    return { tags: cleanTags, meta: { status: "active", featured: false } };
  }
}

export function mergeTagsWithMeta(tags: string[], meta: ProductMeta): string[] {
  const clean = tags.filter((tag) => !String(tag).startsWith(META_PREFIX));
  return [...clean, `${META_PREFIX}${JSON.stringify(meta)}`];
}

export function primarySku(variants: { sku?: string | null }[]): string {
  return variants.find((v) => v.sku)?.sku || "—";
}

export function totalStock(variants: { stock?: number }[]): number {
  return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
}

export function minPrice(variants: { price?: number }[]): number {
  const prices = variants.map((v) => Number(v.price) || 0);
  return prices.length ? Math.min(...prices) : 0;
}
