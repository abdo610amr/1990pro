"use client";

import { useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { Reveal } from "@/components/shared/reveal";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  note?: string;
  className?: string;
  id?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  note,
  className,
  id,
  actionHref,
  actionLabel,
}: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (products.length === 0) return null;

  return (
    <section id={id} className={cn("scroll-mt-24 px-6 pb-32 md:px-12 md:pb-40 bg-background", className)}>
      <div className="mx-auto max-w-[1500px]">
        {(title || subtitle) && (
          <div className="mb-14 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              {subtitle && (
                <Reveal>
                  <span className="label text-wine/70">{subtitle}</span>
                </Reveal>
              )}
              {title && (
                <Reveal delay={100}>
                  <h2 className="display mt-4 text-[clamp(2.5rem,6vw,5.5rem)] uppercase text-primary">
                    {title}
                  </h2>
                </Reveal>
              )}
            </div>
            <div className="flex items-center justify-between md:justify-end gap-6">
              {note && (
                <Reveal delay={200}>
                  <p className="label max-w-xs text-wine/70 hidden lg:block">{note}</p>
                </Reveal>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="label border border-primary p-3 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="label border border-primary p-3 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-6 md:gap-8">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 grow-0 basis-[calc(100%-0px)] sm:basis-[calc(50%-16px)] lg:basis-[calc(25%-24px)]"
              >
                <ProductCard product={product} index={i} priority={i < 4} />
              </div>
            ))}
          </div>
        </div>

        {actionHref && actionLabel && (
          <div className="mt-12 flex justify-center">
            <Reveal>
              <Link
                href={actionHref}
                className="label group inline-flex items-center gap-3 border border-primary px-8 py-4 text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
              >
                {actionLabel}
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
