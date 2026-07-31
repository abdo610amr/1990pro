import { API_BASE_URL } from "@/lib/api-client";
import type {
  BackendBrand,
  BackendCategory,
  BackendProduct,
  BackendReview,
} from "@/lib/backend-types";
import type { Brand, Category, Collection, Product } from "@/types";

const BACKEND_ORIGIN = new URL(API_BASE_URL).origin;

export function resolveAssetUrl(value?: string | null) {
  if (!value) return "/brand-logo.png";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${BACKEND_ORIGIN}${value}`;
  return `${BACKEND_ORIGIN}/${value}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function adaptBrands(brands: BackendBrand[]): Brand[] {
  return brands.map((brand) => ({
    id: String(brand.id),
    slug: brand.slug,
    name: brand.name,
    logo: resolveAssetUrl(brand.logo),
    coverImage: resolveAssetUrl(brand.coverImage),
    story: brand.story,
    about: brand.about,
    categories: brand.categories,
    followers: brand.followers,
    rating: brand.rating,
    socialLinks: brand.socialLinks,
    featured: brand.featured,
  }));
}

export function adaptProducts(
  products: BackendProduct[],
  categories: BackendCategory[],
  brands: BackendBrand[],
  reviews: BackendReview[] = []
): Product[] {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));

  return products.map((product) => {
    const variants = product.variants ?? [];
    const availableVariants = variants.filter((variant) => variant.stock > 0);
    const prices = variants.map((variant) => Number(variant.price) || 0);
    const price = prices.length ? Math.min(...prices) : 0;
    const category = product.categoryId
      ? categoryMap.get(product.categoryId)
      : undefined;
    const brand = brandMap.get(product.brandId ?? 1);
    const tags = product.tags ?? [];
    const productReviews = reviews.filter(
      (review) => review.product_id === product.id
    );
    const rating = productReviews.length
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
        productReviews.length
      : 0;

    const threshold = Number(product.lowStockThreshold) || 5;
    const sizes = variants.map((variant) => {
      const stock = Number(variant.stock) || 0;
      const availability =
        stock <= 0
          ? ("out_of_stock" as const)
          : stock <= threshold
            ? ("low_stock" as const)
            : ("available" as const);
      return {
        label: variant.label,
        inStock: stock > 0,
        stock,
        price: variant.price,
        sku: variant.sku ?? undefined,
        availability,
      };
    });

    return {
      id: String(product.id),
      slug: `${slugify(product.name)}-${product.id}`,
      name: product.name,
      description: product.description,
      longDescription: product.description,
      price,
      images: [product.coverImage, ...(product.gallery ?? [])]
        .filter(Boolean)
        .map(resolveAssetUrl),
      category: category?.slug ?? "uncategorized",
      collection: category?.slug,
      brandId: String(product.brandId ?? 1),
      brandName: brand?.name ?? "1990",
      type: product.productType === "showroom" ? "showroom" : "originals",
      colors: [{ name: "Default", hex: "#5E0F1D" }],
      sizes,
      fabric: product.variantLabel || "Product option",
      tags,
      inStock:
        product.stockStatus !== "sold_out" && availableVariants.length > 0,
      lowStockThreshold: threshold,
      isNew: tags.includes("new"),
      isBestSeller:
        tags.includes("bestseller") || tags.includes("best-seller"),
      isTrending: tags.includes("trending") || tags.includes("bestseller"),
      rating,
      reviewCount: productReviews.length,
      reviews: productReviews.map((review) => ({
        id: String(review.id),
        author: review.name,
        rating: review.rating,
        date: review.createdAt ?? "2026-01-01",
        comment: review.comment ?? "",
        verified: false,
      })),
      createdAt: new Date(Date.UTC(2020, 0, product.id)).toISOString(),
    };
  });
}

export function adaptCategories(
  categories: BackendCategory[],
  products: BackendProduct[]
): Category[] {
  return categories
    .filter((category) => category.active)
    .map((category) => {
      const categoryProducts = products.filter(
        (product) => product.categoryId === category.id
      );
      return {
        id: String(category.id),
        slug: category.slug,
        name: category.name,
        image: resolveAssetUrl(
          category.image ?? categoryProducts[0]?.coverImage
        ),
        productCount: categoryProducts.length,
      };
    });
}

export function categoriesToCollections(
  categories: BackendCategory[],
  products: BackendProduct[]
): Collection[] {
  return categories
    .filter((category) => category.active)
    .map((category) => {
      const categoryProducts = products.filter(
        (product) => product.categoryId === category.id
      );
      return {
        id: String(category.id),
        slug: category.slug,
        name: category.name,
        description: category.description,
        image: resolveAssetUrl(
          category.image ?? categoryProducts[0]?.coverImage
        ),
        productIds: categoryProducts.map((product) => String(product.id)),
      };
    });
}
