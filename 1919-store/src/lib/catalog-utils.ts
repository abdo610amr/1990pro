import type { Product, ProductFilters } from "@/types";

export function getProductBySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(products: Product[], id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsByBrand(products: Product[], brandId: string) {
  return products.filter((product) => product.brandId === brandId);
}

export function getProductsByType(
  products: Product[],
  type: "originals" | "showroom"
) {
  return products.filter((product) => product.type === type);
}

export function getBestSellers(products: Product[], limit = 8) {
  return products.filter((product) => product.isBestSeller).slice(0, limit);
}

export function getNewArrivals(products: Product[], limit = 8) {
  return products.filter((product) => product.isNew).slice(0, limit);
}

export function getTrendingProducts(products: Product[], limit = 8) {
  return products.filter((product) => product.isTrending).slice(0, limit);
}

export function getRelatedProducts(
  products: Product[],
  selected: Product,
  limit = 4
) {
  return products
    .filter(
      (product) =>
        product.id !== selected.id &&
        (product.category === selected.category ||
          product.brandId === selected.brandId)
    )
    .slice(0, limit);
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters
) {
  let result = [...products];
  if (filters.type) result = result.filter((p) => p.type === filters.type);
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters.brand) {
    result = result.filter(
      (p) =>
        p.brandId === filters.brand ||
        p.brandName.toLowerCase() === filters.brand?.toLowerCase()
    );
  }
  if (filters.color) {
    result = result.filter((p) =>
      p.colors.some(
        (color) => color.name.toLowerCase() === filters.color?.toLowerCase()
      )
    );
  }
  if (filters.size) {
    result = result.filter((p) =>
      p.sizes.some((size) => size.label === filters.size && size.inStock)
    );
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.availability === "in-stock") {
    result = result.filter((p) => p.inStock);
  }
  if (filters.collection) {
    result = result.filter((p) => p.collection === filters.collection);
  }
  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brandName.toLowerCase().includes(query) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  switch (filters.sort) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "best-selling":
      return result.sort(
        (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller)
      );
    case "popularity":
      return result.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return result;
  }
}
