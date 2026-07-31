"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HeroBanner } from "@/components/home/hero-banner";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { ProductCard } from "@/components/shared/product-card";
import { BrandCard } from "@/components/shared/brand-card";
import { CategoryCard } from "@/components/shared/category-card";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import {
  getBestSellers,
  getNewArrivals,
  getTrendingProducts,
  getProductsByType,
} from "@/lib/catalog-utils";
import { useCatalog } from "@/providers/catalog-provider";

const instagramImages = [
  "https://images.unsplash.com/photo-1469334031216-e382a71b716b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728fa4b65?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
];

export default function HomePage() {
  const { products, categories, collections, brands } = useCatalog();
  const bestSellers = getBestSellers(products);
  const newArrivals = getNewArrivals(products);
  const trending = getTrendingProducts(products);
  const originals = getProductsByType(products, "originals").slice(0, 4);
  const featuredBrands = brands.filter((brand) => brand.featured);

  return (
    <>
      <HeroBanner />

      <ProductCarousel
        products={bestSellers}
        title="Best Sellers"
        subtitle="Most Loved"
      />

      <section className="luxury-section bg-secondary/30">
        <div className="luxury-container">
          <div className="mb-10 text-center">
            <p className="luxury-subheading">Curated Edit</p>
            <h2 className="luxury-heading mt-2">Featured Collections</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {collections.slice(0, 2).map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative aspect-[16/9] overflow-hidden rounded-2xl"
              >
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="image-zoom object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute right-6 bottom-6 left-6">
                  <h3 className="font-heading text-2xl font-light text-white md:text-3xl">
                    {collection.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">
                    {collection.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm text-white group-hover:underline">
                    Explore Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductCarousel
        products={newArrivals}
        title="New Arrivals"
        subtitle="Just Dropped"
      />

      <section className="luxury-section">
        <div className="luxury-container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="luxury-subheading">Official</p>
              <h2 className="luxury-heading mt-2">1990 Originals</h2>
            </div>
            <Link href="/originals">
              <Button variant="outline" className="rounded-full">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {originals.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section bg-secondary/30">
        <div className="luxury-container">
          <div className="mb-10 text-center">
            <p className="luxury-subheading">Showroom</p>
            <h2 className="luxury-heading mt-2">Featured Local Brands</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section">
        <div className="luxury-container">
          <div className="mb-10 text-center">
            <p className="luxury-subheading">Browse</p>
            <h2 className="luxury-heading mt-2">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 md:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <ProductCarousel
        products={trending}
        title="Trending Now"
        subtitle="Hot Right Now"
      />

      <section className="luxury-section">
        <div className="luxury-container">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16">
            <p className="text-sm uppercase tracking-[0.2em] opacity-80">
              Newsletter
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light md:text-4xl">
              Join the Originals
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm opacity-80">
              Be first to know about new drops, exclusive collections, and
              member-only access.
            </p>
            <NewsletterForm variant="inline" />
          </div>
        </div>
      </section>

      <section className="luxury-section bg-secondary/30">
        <div className="luxury-container">
          <div className="mb-10 text-center">
            <p className="luxury-subheading">@1990official</p>
            <h2 className="luxury-heading mt-2">Follow Our Journey</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4">
            {instagramImages.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={img}
                  alt={`Instagram post ${i + 1}`}
                  fill
                  className="image-zoom object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
