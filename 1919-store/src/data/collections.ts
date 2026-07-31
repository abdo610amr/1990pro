import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    id: "col-autumn-winter",
    slug: "autumn-winter-2026",
    name: "Autumn Winter 2026",
    description: "Layered luxury for the colder months. Rich textures, deep tones, and architectural silhouettes define this season's essential collection.",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&h=800&fit=crop",
    productIds: ["prod-001", "prod-002", "prod-003", "prod-007", "prod-010"],
  },
  {
    id: "col-essentials",
    slug: "essentials",
    name: "Essentials",
    description: "Timeless pieces designed to anchor your wardrobe. Premium basics elevated through superior materials and refined construction.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop",
    productIds: ["prod-004", "prod-005", "prod-008", "prod-011", "prod-014"],
  },
  {
    id: "col-street-luxe",
    slug: "street-luxe",
    name: "Street Luxe",
    description: "Where street culture meets high fashion. Bold graphics, oversized fits, and premium fabrics collide in this curated edit.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=800&fit=crop",
    productIds: ["prod-006", "prod-009", "prod-012", "prod-015", "prod-016"],
  },
  {
    id: "col-minimal-edit",
    slug: "minimal-edit",
    name: "The Minimal Edit",
    description: "Less is more. A carefully curated selection of monochromatic pieces that speak through quality, not quantity.",
    image: "https://images.unsplash.com/photo-1490114538077-0a7f8a498178?w=1200&h=800&fit=crop",
    productIds: ["prod-013", "prod-017", "prod-018", "prod-019", "prod-020"],
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}
