import type { Brand } from "@/types";

export const brands: Brand[] = [
  {
    id: "brand-1990",
    slug: "1990",
    name: "1990",
    logo: "/brand-logo.png",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop",
    story: "Born from a vision of timeless originality.",
    about: "1990 represents the pinnacle of luxury streetwear — crafted for those who refuse to follow trends and instead define them. Every piece is designed with meticulous attention to detail, premium materials, and an uncompromising commitment to quality.",
    categories: ["Outerwear", "Tops", "Bottoms", "Accessories"],
    followers: 125000,
    rating: 4.9,
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      website: "https://1990.com",
    },
    featured: true,
  },
  {
    id: "brand-maison-noir",
    slug: "maison-noir",
    name: "Maison Noir",
    logo: "https://images.unsplash.com/photo-1562157873-818bc0726fc4?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=600&fit=crop",
    story: "Dark elegance redefined for the modern era.",
    about: "Maison Noir blends Parisian sophistication with contemporary street culture. Each collection tells a story of contrast — light and shadow, structure and fluidity — resulting in garments that transcend seasons.",
    categories: ["Outerwear", "Knitwear", "Tailoring"],
    followers: 87000,
    rating: 4.8,
    socialLinks: {
      instagram: "https://instagram.com",
      website: "https://maisonnoir.com",
    },
    featured: true,
  },
  {
    id: "brand-velvet-arc",
    slug: "velvet-arc",
    name: "Velvet Arc",
    logo: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=600&fit=crop",
    story: "Where texture meets intention.",
    about: "Velvet Arc specializes in luxurious fabrics and architectural silhouettes. From Italian wool coats to Japanese denim, every material is sourced with purpose and crafted with precision.",
    categories: ["Outerwear", "Denim", "Accessories"],
    followers: 62000,
    rating: 4.7,
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
    featured: true,
  },
  {
    id: "brand-urban-atelier",
    slug: "urban-atelier",
    name: "Urban Atelier",
    logo: "https://images.unsplash.com/photo-1558171813-4c088753af4f?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1469334031216-e382a71b716b?w=1600&h=600&fit=crop",
    story: "Handcrafted luxury for the city dweller.",
    about: "Urban Atelier creates elevated essentials for those who navigate the intersection of art, culture, and commerce. Limited runs, artisan techniques, and a distinctly local perspective define every release.",
    categories: ["Tops", "Bottoms", "Footwear"],
    followers: 45000,
    rating: 4.6,
    socialLinks: {
      instagram: "https://instagram.com",
      website: "https://urbanatelier.com",
    },
    featured: false,
  },
  {
    id: "brand-silk-republic",
    slug: "silk-republic",
    name: "Silk Republic",
    logo: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1483985988355-763728fa4b65?w=1600&h=600&fit=crop",
    story: "Fluid luxury in every thread.",
    about: "Silk Republic celebrates the art of draping and movement. Specializing in premium silks, linens, and flowing silhouettes, the brand offers an antidote to rigid fashion norms.",
    categories: ["Dresses", "Tops", "Accessories"],
    followers: 38000,
    rating: 4.5,
    socialLinks: {
      instagram: "https://instagram.com",
    },
    featured: false,
  },
  {
    id: "brand-iron-garden",
    slug: "iron-garden",
    name: "Iron Garden",
    logo: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&h=600&fit=crop",
    story: "Industrial strength meets botanical grace.",
    about: "Iron Garden fuses workwear heritage with contemporary tailoring. Raw edges, reinforced stitching, and unexpected fabric combinations create pieces that age beautifully with wear.",
    categories: ["Workwear", "Outerwear", "Accessories"],
    followers: 29000,
    rating: 4.4,
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
    featured: false,
  },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getFeaturedBrands(): Brand[] {
  return brands.filter((b) => b.featured && b.slug !== "1990");
}
