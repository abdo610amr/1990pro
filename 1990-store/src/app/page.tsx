"use client";

import Link from "next/link";
import Image from "next/image";
import { HeroBanner } from "@/components/home/hero-banner";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { Reveal } from "@/components/shared/reveal";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { StoreLocation } from "@/components/shared/store-location";
import { useReveal } from "@/hooks/use-reveal";
import {
  getBestSellers,
  getNewArrivals,
  getTrendingProducts,
} from "@/lib/catalog-utils";
import { useCatalog } from "@/providers/catalog-provider";
import { cn } from "@/lib/utils";

function ImageReveal({
  src,
  alt,
  className,
  ratio,
}: {
  src: string;
  alt: string;
  className?: string;
  ratio: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={cn("overflow-hidden bg-secondary border border-border", className)}>
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        loading="lazy"
        className={cn("clip-reveal w-full object-cover", ratio, visible && "is-visible")}
      />
    </div>
  );
}

export default function HomePage() {
  const { products } = useCatalog();
  const bestSellers = getBestSellers(products);
  const newArrivals = getNewArrivals(products);

  return (
    <div id="top" className="min-h-screen bg-background font-body text-primary">
      {/* 1. HERO BANNER (with background slideshow) */}
      <HeroBanner />

      {/* 2. BRAND STATEMENT */}
      <section className="px-6 py-32 md:px-12 md:py-48">
        <div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal>
              <h2 className="display text-[clamp(2rem,5.4vw,4.75rem)] uppercase text-primary">
                Not made for
                <br />
                everyone.
                <br />
                <span className="text-wine">Made for originals.</span>
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-4 md:pt-4">
            <Reveal delay={180}>
              <p className="max-w-sm text-base leading-relaxed text-wine/80">
                1990 is built for individuality, authenticity and timeless pieces. A modern
                streetwear identity inspired by those who choose their own direction.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10 h-px w-full bg-border" />
              <p className="label mt-6 text-wine/60">Originals only — since 2026</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <ProductCarousel
        id="new-arrivals"
        products={newArrivals}
        title="New Arrivals"
        subtitle="Just Dropped"
        note="The latest pieces, fresh in."
        actionHref="/shop?sort=newest"
        actionLabel="View All"
      />

      {/* 4. BEST SELLERS */}
      <ProductCarousel
        id="best-sellers"
        products={bestSellers}
        title="Best Sellers"
        subtitle="Best Sellers"
        note="The ones you keep coming back to."
        actionHref="/shop?sort=best-selling"
        actionLabel="View All"
      />

      {/* 5. VISUAL STATEMENT / CAMPAIGN BANNER */}
      <section className="relative px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto max-w-[1500px]">
          <ImageReveal
            src="https://images.unsplash.com/photo-1469334031216-e382a71b716b?w=1600&h=900&fit=crop"
            alt="1990 Campaign Statement"
            ratio="aspect-[16/10] md:aspect-[16/8]"
          />
          <Reveal>
            <h2 className="display mt-10 text-[clamp(2.25rem,8vw,7rem)] uppercase text-primary">
              Wear your original.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* 5b. FIND OUR STORE */}
      <StoreLocation />

      {/* 6. COMING SOON & NEWSLETTER */}
      <section id="coming-soon" className="scroll-mt-24 px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto grid max-w-[1500px] items-end gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <ImageReveal
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&h=1200&fit=crop"
              alt="Next 1990 Drop Teaser"
              ratio="aspect-[4/5] md:aspect-[4/4.4]"
            />
          </div>
          <div className="md:col-span-5 md:pb-6">
            <Reveal>
              <span className="label text-wine/70">New Drop</span>
            </Reveal>
            <Reveal delay={220}>
              <h2 className="display mt-5 text-[clamp(2.75rem,7vw,6rem)] uppercase text-primary">
                Coming
                <br />
                Soon
              </h2>
            </Reveal>
            <Reveal delay={460}>
              <p className="label mt-8 text-wine/70">A new chapter is on the way.</p>
            </Reveal>
            <Reveal delay={640}>
              <NewsletterForm variant="inline" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. BRAND VALUES */}
      <section className="px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto grid max-w-[1500px] gap-12 border-t border-border pt-14 md:grid-cols-3 md:gap-16">
          {[
            ["01", "Originality", "Designed for people who don't follow the crowd."],
            ["02", "Quality", "Thoughtful pieces made to become everyday essentials."],
            ["03", "Identity", "Your style. Your story. Your rules."],
          ].map(([n, title, copy], i) => (
            <Reveal key={n} delay={i * 160}>
              <div className="md:border-l md:border-border md:pl-8 md:first:border-l-0 md:first:pl-0">
                <span className="label text-wine/60">{n}</span>
                <h3 className="display mt-4 text-3xl uppercase text-primary md:text-4xl">{title}</h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-wine/75">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section id="final" className="grain scroll-mt-24 bg-primary px-6 py-36 md:px-12 md:py-52">
        <div className="mx-auto max-w-[1500px] text-center">
          <Reveal>
            <h2 className="display text-[clamp(3.5rem,14vw,11rem)] uppercase text-primary-foreground">
              Be original.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="label mt-8 text-primary-foreground/70">Discover the 1990 collection.</p>
          </Reveal>
          <Reveal delay={340}>
            <Link
              href="/shop"
              className="label mt-14 inline-block border border-primary-foreground px-10 py-4 text-primary-foreground transition-colors duration-500 hover:bg-primary-foreground hover:text-primary"
            >
              Shop 1990
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
