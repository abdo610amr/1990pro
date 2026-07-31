import type { Product, ProductFilters } from "@/types";
import { collections } from "@/data/collections";

const defaultSizes = [
  { label: "XS", inStock: true },
  { label: "S", inStock: true },
  { label: "M", inStock: true },
  { label: "L", inStock: true },
  { label: "XL", inStock: false },
];

export const products: Product[] = [
  {
    id: "prod-001",
    slug: "signature-wool-overcoat",
    name: "Signature Wool Overcoat",
    description: "Double-breasted wool overcoat with structured shoulders.",
    longDescription: "Crafted from premium Italian wool, this signature overcoat features a double-breasted closure, structured shoulders, and a relaxed yet refined silhouette. Fully lined with satin for effortless layering. The epitome of winter luxury.",
    price: 895,
    compareAtPrice: 1100,
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce267608?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    collection: "autumn-winter-2026",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: defaultSizes,
    fabric: "100% Italian Wool",
    tags: ["overcoat", "winter", "luxury", "wool"],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isTrending: true,
    rating: 4.9,
    reviewCount: 47,
    reviews: [
      { id: "r1", author: "James M.", rating: 5, date: "2026-01-15", comment: "Exceptional quality. The wool is incredibly soft and the fit is perfect.", verified: true },
      { id: "r2", author: "Sarah K.", rating: 5, date: "2026-01-08", comment: "Worth every penny. This coat turns heads everywhere I go.", verified: true },
    ],
    createdAt: "2026-01-01",
  },
  {
    id: "prod-002",
    slug: "premium-cashmere-hoodie",
    name: "Premium Cashmere Hoodie",
    description: "Ultra-soft cashmere blend hoodie with minimal branding.",
    longDescription: "Elevate your casual wardrobe with this premium cashmere blend hoodie. Featuring a relaxed fit, kangaroo pocket, and ribbed cuffs. Subtle 1990 embroidery on the chest. The perfect intersection of comfort and luxury.",
    price: 425,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop",
    ],
    category: "tops",
    collection: "essentials",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "Cream", hex: "#FFFDD0" },
      { name: "Burgundy", hex: "#5E0F1D" },
      { name: "Grey", hex: "#808080" },
    ],
    sizes: defaultSizes,
    fabric: "85% Cashmere, 15% Silk",
    tags: ["hoodie", "cashmere", "essentials"],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 89,
    reviews: [
      { id: "r3", author: "Alex T.", rating: 5, date: "2026-02-01", comment: "Softest hoodie I've ever owned. The burgundy color is stunning.", verified: true },
    ],
    createdAt: "2026-01-15",
  },
  {
    id: "prod-003",
    slug: "structured-blazer",
    name: "Structured Tailored Blazer",
    description: "Sharp-shouldered blazer in premium suiting fabric.",
    longDescription: "A modern take on classic tailoring. This structured blazer features peak lapels, a single-button closure, and functional sleeve buttons. Cut from Japanese suiting fabric with a subtle texture.",
    price: 650,
    compareAtPrice: 780,
    images: [
      "https://images.unsplash.com/photo-1594938298605-cd883d217104?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779514523?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    collection: "autumn-winter-2026",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "Navy", hex: "#000080" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: defaultSizes,
    fabric: "100% Wool Suiting",
    tags: ["blazer", "tailoring", "formal"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: false,
    rating: 4.7,
    reviewCount: 34,
    reviews: [],
    createdAt: "2025-11-01",
  },
  {
    id: "prod-004",
    slug: "minimal-crew-tee",
    name: "Minimal Crew Neck Tee",
    description: "Premium heavyweight cotton tee with perfect drape.",
    longDescription: "The foundation of every wardrobe. This heavyweight cotton tee features a relaxed fit, reinforced neckline, and a luxurious hand feel. Pre-shrunk and garment-dyed for lasting color.",
    price: 95,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop",
    ],
    category: "tops",
    collection: "essentials",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#1E1E1E" },
      { name: "Sand", hex: "#C2B280" },
    ],
    sizes: defaultSizes,
    fabric: "100% Organic Cotton, 280gsm",
    tags: ["tee", "basics", "cotton"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: true,
    rating: 4.6,
    reviewCount: 156,
    reviews: [],
    createdAt: "2025-09-01",
  },
  {
    id: "prod-005",
    slug: "wide-leg-trousers",
    name: "Wide Leg Wool Trousers",
    description: "High-waisted wide leg trousers in fine wool.",
    longDescription: "Effortlessly elegant wide leg trousers crafted from fine wool. Features a high waist, pressed crease, and side adjusters. The perfect complement to both casual and formal looks.",
    price: 320,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a51?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=800&h=1000&fit=crop",
    ],
    category: "bottoms",
    collection: "essentials",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: defaultSizes,
    fabric: "100% Wool",
    tags: ["trousers", "wool", "tailoring"],
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isTrending: true,
    rating: 4.5,
    reviewCount: 28,
    reviews: [],
    createdAt: "2025-10-15",
  },
  {
    id: "prod-006",
    slug: "leather-bomber-jacket",
    name: "Leather Bomber Jacket",
    description: "Premium lambskin bomber with satin lining.",
    longDescription: "A timeless bomber reimagined in premium lambskin leather. Features ribbed cuffs and hem, two front pockets, and a satin lining. Ages beautifully with wear, developing a unique patina over time.",
    price: 1250,
    compareAtPrice: 1500,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956daccc?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    collection: "street-luxe",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [{ name: "Black", hex: "#1E1E1E" }],
    sizes: defaultSizes,
    fabric: "100% Lambskin Leather",
    tags: ["leather", "bomber", "jacket"],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isTrending: true,
    rating: 4.9,
    reviewCount: 23,
    reviews: [],
    createdAt: "2026-02-01",
  },
  {
    id: "prod-007",
    slug: "noir-velvet-blazer",
    name: "Noir Velvet Blazer",
    description: "Deep black velvet blazer with satin lapels.",
    longDescription: "Maison Noir's signature piece. This deep black velvet blazer features contrast satin lapels, a slim fit, and a single-button closure. Perfect for evening occasions or elevated casual wear.",
    price: 780,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779514523?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1594938298605-cd883d217104?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    brandId: "brand-maison-noir",
    brandName: "Maison Noir",
    type: "showroom",
    colors: [{ name: "Black", hex: "#1E1E1E" }],
    sizes: defaultSizes,
    fabric: "100% Cotton Velvet",
    tags: ["velvet", "blazer", "evening"],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isTrending: false,
    rating: 4.8,
    reviewCount: 19,
    reviews: [],
    createdAt: "2026-01-20",
  },
  {
    id: "prod-008",
    slug: "merino-turtleneck",
    name: "Merino Wool Turtleneck",
    description: "Fine gauge merino turtleneck in multiple colors.",
    longDescription: "Maison Noir's essential merino turtleneck. Fine gauge knit with a slim fit and ribbed cuffs. Layer under blazers or wear alone for a refined minimalist look.",
    price: 245,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop",
    ],
    category: "knitwear",
    brandId: "brand-maison-noir",
    brandName: "Maison Noir",
    type: "showroom",
    colors: [
      { name: "Black", hex: "#1E1E1E" },
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Burgundy", hex: "#5E0F1D" },
    ],
    sizes: defaultSizes,
    fabric: "100% Extra Fine Merino Wool",
    tags: ["turtleneck", "knitwear", "merino"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 42,
    reviews: [],
    createdAt: "2025-12-01",
  },
  {
    id: "prod-009",
    slug: "arc-denim-jacket",
    name: "Japanese Selvedge Denim Jacket",
    description: "Raw selvedge denim jacket with custom hardware.",
    longDescription: "Velvet Arc's signature denim jacket crafted from 14oz Japanese selvedge denim. Features custom brass hardware, chain-stitched hems, and a classic trucker silhouette. Designed to fade uniquely with wear.",
    price: 395,
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    collection: "street-luxe",
    brandId: "brand-velvet-arc",
    brandName: "Velvet Arc",
    type: "showroom",
    colors: [{ name: "Indigo", hex: "#3F5277" }],
    sizes: defaultSizes,
    fabric: "100% Japanese Selvedge Denim, 14oz",
    tags: ["denim", "jacket", "selvedge"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 67,
    reviews: [],
    createdAt: "2025-08-15",
  },
  {
    id: "prod-010",
    slug: "cashmere-scarf",
    name: "Cashmere Wrap Scarf",
    description: "Oversized cashmere scarf with fringed edges.",
    longDescription: "An oversized cashmere wrap scarf that doubles as a shawl. Soft fringed edges and a generous size make this the ultimate cold-weather accessory. Available in a range of muted tones.",
    price: 185,
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d744a2d9b9?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1601924994987-196e8b35f318?w=800&h=1000&fit=crop",
    ],
    category: "accessories",
    collection: "autumn-winter-2026",
    brandId: "brand-velvet-arc",
    brandName: "Velvet Arc",
    type: "showroom",
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Grey", hex: "#808080" },
      { name: "Burgundy", hex: "#5E0F1D" },
    ],
    sizes: [{ label: "One Size", inStock: true }],
    fabric: "100% Mongolian Cashmere",
    tags: ["scarf", "cashmere", "accessories"],
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isTrending: true,
    rating: 4.9,
    reviewCount: 31,
    reviews: [],
    createdAt: "2026-01-10",
  },
  {
    id: "prod-011",
    slug: "urban-oxford-shirt",
    name: "Premium Oxford Shirt",
    description: "Classic oxford cloth button-down in relaxed fit.",
    longDescription: "Urban Atelier's take on the classic oxford shirt. Premium oxford cloth with a relaxed fit, button-down collar, and mother-of-pearl buttons. Versatile enough for office or weekend.",
    price: 165,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b00?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop",
    ],
    category: "tops",
    collection: "essentials",
    brandId: "brand-urban-atelier",
    brandName: "Urban Atelier",
    type: "showroom",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Light Blue", hex: "#ADD8E6" },
      { name: "Pink", hex: "#FFB6C1" },
    ],
    sizes: defaultSizes,
    fabric: "100% Oxford Cotton",
    tags: ["shirt", "oxford", "classic"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: false,
    rating: 4.5,
    reviewCount: 78,
    reviews: [],
    createdAt: "2025-07-01",
  },
  {
    id: "prod-012",
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    description: "Bias-cut silk slip dress with adjustable straps.",
    longDescription: "Silk Republic's signature slip dress. Cut on the bias from pure mulberry silk for a fluid, flattering drape. Adjustable straps and a midi length make this a versatile wardrobe staple.",
    price: 520,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059581667?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=1000&fit=crop",
    ],
    category: "tops",
    collection: "street-luxe",
    brandId: "brand-silk-republic",
    brandName: "Silk Republic",
    type: "showroom",
    colors: [
      { name: "Champagne", hex: "#F7E7CE" },
      { name: "Black", hex: "#1E1E1E" },
      { name: "Emerald", hex: "#50C878" },
    ],
    sizes: defaultSizes,
    fabric: "100% Mulberry Silk",
    tags: ["dress", "silk", "evening"],
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isTrending: true,
    rating: 4.8,
    reviewCount: 25,
    reviews: [],
    createdAt: "2026-02-10",
  },
  {
    id: "prod-013",
    slug: "minimal-leather-sneakers",
    name: "Minimal Leather Sneakers",
    description: "Clean leather sneakers with cupsole construction.",
    longDescription: "1990's minimal leather sneakers feature a clean silhouette, premium full-grain leather upper, and a durable cupsole. Designed for all-day comfort without sacrificing style.",
    price: 295,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=1000&fit=crop",
    ],
    category: "footwear",
    collection: "minimal-edit",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: [
      { label: "40", inStock: true },
      { label: "41", inStock: true },
      { label: "42", inStock: true },
      { label: "43", inStock: true },
      { label: "44", inStock: false },
    ],
    fabric: "Full-Grain Leather Upper, Rubber Cupsole",
    tags: ["sneakers", "leather", "footwear"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 112,
    reviews: [],
    createdAt: "2025-06-01",
  },
  {
    id: "prod-014",
    slug: "iron-garden-work-jacket",
    name: "Canvas Work Jacket",
    description: "Heavyweight canvas work jacket with reinforced stitching.",
    longDescription: "Iron Garden's signature work jacket. Heavyweight waxed canvas with reinforced stitching, multiple utility pockets, and a boxy fit. Built to last generations.",
    price: 340,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    collection: "essentials",
    brandId: "brand-iron-garden",
    brandName: "Iron Garden",
    type: "showroom",
    colors: [
      { name: "Olive", hex: "#808000" },
      { name: "Navy", hex: "#000080" },
    ],
    sizes: defaultSizes,
    fabric: "100% Waxed Cotton Canvas",
    tags: ["workwear", "jacket", "canvas"],
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isTrending: false,
    rating: 4.6,
    reviewCount: 38,
    reviews: [],
    createdAt: "2025-05-01",
  },
  {
    id: "prod-015",
    slug: "graphic-oversized-tee",
    name: "Originals Graphic Tee",
    description: "Oversized tee with subtle 1990 graphic print.",
    longDescription: "Make a statement with this oversized graphic tee. Premium heavyweight cotton with a subtle tonal 1990 print on the back. Drop shoulder construction for a relaxed streetwear fit.",
    price: 120,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop",
    ],
    category: "tops",
    collection: "street-luxe",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "Black", hex: "#1E1E1E" },
      { name: "White", hex: "#FFFFFF" },
    ],
    sizes: defaultSizes,
    fabric: "100% Organic Cotton, 300gsm",
    tags: ["graphic", "tee", "streetwear"],
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isTrending: true,
    rating: 4.4,
    reviewCount: 45,
    reviews: [],
    createdAt: "2026-02-15",
  },
  {
    id: "prod-016",
    slug: "leather-crossbody-bag",
    name: "Leather Crossbody Bag",
    description: "Compact crossbody in pebbled leather with brass hardware.",
    longDescription: "A compact crossbody bag crafted from pebbled Italian leather. Features an adjustable strap, interior card slots, and a magnetic closure. The perfect everyday companion.",
    price: 275,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
    ],
    category: "accessories",
    collection: "street-luxe",
    brandId: "brand-urban-atelier",
    brandName: "Urban Atelier",
    type: "showroom",
    colors: [
      { name: "Tan", hex: "#D2B48C" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: [{ label: "One Size", inStock: true }],
    fabric: "Pebbled Italian Leather",
    tags: ["bag", "leather", "accessories"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: false,
    rating: 4.7,
    reviewCount: 52,
    reviews: [],
    createdAt: "2025-04-01",
  },
  {
    id: "prod-017",
    slug: "linen-relaxed-pants",
    name: "Relaxed Linen Pants",
    description: "Wide leg linen pants with drawstring waist.",
    longDescription: "Effortless summer dressing starts here. These relaxed linen pants feature a wide leg, drawstring waist, and side pockets. Breathable European linen that gets softer with every wash.",
    price: 210,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a51?w=800&h=1000&fit=crop",
    ],
    category: "bottoms",
    collection: "minimal-edit",
    brandId: "brand-silk-republic",
    brandName: "Silk Republic",
    type: "showroom",
    colors: [
      { name: "Natural", hex: "#F5F5DC" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: defaultSizes,
    fabric: "100% European Linen",
    tags: ["linen", "pants", "summer"],
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isTrending: true,
    rating: 4.5,
    reviewCount: 18,
    reviews: [],
    createdAt: "2026-03-01",
  },
  {
    id: "prod-018",
    slug: "wool-knit-beanie",
    name: "Merino Knit Beanie",
    description: "Ribbed merino wool beanie with folded cuff.",
    longDescription: "A winter essential crafted from extra fine merino wool. Ribbed knit construction with a folded cuff. Soft, warm, and naturally odor-resistant.",
    price: 75,
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=1000&fit=crop",
    ],
    category: "accessories",
    collection: "minimal-edit",
    brandId: "brand-1990",
    brandName: "1990",
    type: "originals",
    colors: [
      { name: "Black", hex: "#1E1E1E" },
      { name: "Grey", hex: "#808080" },
      { name: "Cream", hex: "#FFFDD0" },
    ],
    sizes: [{ label: "One Size", inStock: true }],
    fabric: "100% Extra Fine Merino Wool",
    tags: ["beanie", "knitwear", "winter"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: false,
    rating: 4.6,
    reviewCount: 94,
    reviews: [],
    createdAt: "2025-10-01",
  },
  {
    id: "prod-019",
    slug: "suede-chelsea-boots",
    name: "Suede Chelsea Boots",
    description: "Classic Chelsea boots in premium suede with crepe sole.",
    longDescription: "Timeless Chelsea boots crafted from premium suede with elastic side panels and a crepe rubber sole. Goodyear welted construction ensures durability and the ability to resole.",
    price: 450,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b611?w=800&h=1000&fit=crop",
    ],
    category: "footwear",
    collection: "minimal-edit",
    brandId: "brand-maison-noir",
    brandName: "Maison Noir",
    type: "showroom",
    colors: [
      { name: "Sand", hex: "#C2B280" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: [
      { label: "40", inStock: true },
      { label: "41", inStock: true },
      { label: "42", inStock: true },
      { label: "43", inStock: false },
      { label: "44", inStock: true },
    ],
    fabric: "Premium Suede Upper, Crepe Rubber Sole",
    tags: ["boots", "suede", "footwear"],
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 61,
    reviews: [],
    createdAt: "2025-03-01",
  },
  {
    id: "prod-020",
    slug: "quilted-liner-jacket",
    name: "Quilted Liner Jacket",
    description: "Lightweight quilted jacket perfect for layering.",
    longDescription: "A versatile quilted liner jacket that works as a standalone piece or under heavier coats. Lightweight insulation, snap closure, and two front pockets. Packable design for travel.",
    price: 380,
    images: [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce267608?w=800&h=1000&fit=crop",
    ],
    category: "outerwear",
    collection: "minimal-edit",
    brandId: "brand-velvet-arc",
    brandName: "Velvet Arc",
    type: "showroom",
    colors: [
      { name: "Olive", hex: "#808000" },
      { name: "Navy", hex: "#000080" },
      { name: "Black", hex: "#1E1E1E" },
    ],
    sizes: defaultSizes,
    fabric: "Nylon Shell, Primaloft Insulation",
    tags: ["quilted", "jacket", "layering"],
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isTrending: true,
    rating: 4.5,
    reviewCount: 15,
    reviews: [],
    createdAt: "2026-02-20",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter((p) => p.brandId === brandId);
}

export function getProductsByType(type: "originals" | "showroom"): Product[] {
  return products.filter((p) => p.type === type);
}

export function getBestSellers(limit = 8): Product[] {
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export function getNewArrivals(limit = 8): Product[] {
  return products
    .filter((p) => p.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getTrendingProducts(limit = 8): Product[] {
  return products.filter((p) => p.isTrending).slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brandId === product.brandId))
    .slice(0, limit);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  const collection = collections.find((c) => c.slug === collectionSlug);
  if (!collection) return [];
  return products.filter((p) => collection.productIds.includes(p.id));
}

export function filterProducts(filters: ProductFilters): Product[] {
  let result = [...products];

  if (filters.type) {
    result = result.filter((p) => p.type === filters.type);
  }
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters.brand) {
    result = result.filter((p) => p.brandId === filters.brand || p.brandName.toLowerCase() === filters.brand?.toLowerCase());
  }
  if (filters.color) {
    result = result.filter((p) =>
      p.colors.some((c) => c.name.toLowerCase() === filters.color?.toLowerCase())
    );
  }
  if (filters.size) {
    result = result.filter((p) =>
      p.sizes.some((s) => s.label === filters.size && s.inStock)
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
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "best-selling":
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      break;
    case "popularity":
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return result;
}

export function searchProducts(query: string) {
  return filterProducts({ search: query });
}
