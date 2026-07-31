import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-outerwear",
    slug: "outerwear",
    name: "Outerwear",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce267608?w=600&h=800&fit=crop",
    productCount: 24,
  },
  {
    id: "cat-tops",
    slug: "tops",
    name: "Tops",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
    productCount: 36,
  },
  {
    id: "cat-bottoms",
    slug: "bottoms",
    name: "Bottoms",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a51?w=600&h=800&fit=crop",
    productCount: 28,
  },
  {
    id: "cat-footwear",
    slug: "footwear",
    name: "Footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop",
    productCount: 18,
  },
  {
    id: "cat-accessories",
    slug: "accessories",
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
    productCount: 22,
  },
  {
    id: "cat-knitwear",
    slug: "knitwear",
    name: "Knitwear",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop",
    productCount: 16,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
