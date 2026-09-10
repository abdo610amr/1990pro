// Homepage hero background slideshow.
// Managed here in the website (not in Odoo). To change the banners, edit this
// list: use any image URL, or drop a file in /public and reference it like
// "/my-banner.jpg". Order is controlled by `sort_order`.

export interface HomeBanner {
  id: string;
  image: string;
  title: string;
  description?: string;
  link: string;
  sort_order: number;
}

export const HOME_BANNERS: HomeBanner[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop",
    title: "1990 FLAGSHIP STORE",
    description: "Luxury fashion destination and editorial showroom.",
    link: "/shop",
    sort_order: 1,
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1469334031216-e382a71b716b?w=1600&h=900&fit=crop",
    title: "EDITORIAL CAMPAIGN",
    description: "Crafted for originals who define luxury on their terms.",
    link: "/shop",
    sort_order: 2,
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop",
    title: "SHOWROOM INTERIORS",
    description: "Considered spaces for considered pieces.",
    link: "/shop",
    sort_order: 3,
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop",
    title: "LIFESTYLE & WEAR",
    description: "Made for individuality, authenticity and timeless pieces.",
    link: "/shop",
    sort_order: 4,
  },
];
