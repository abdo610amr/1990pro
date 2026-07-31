"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  className,
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
    <section className={cn("luxury-section", className)}>
      <div className="luxury-container">
        {(title || subtitle) && (
          <div className="mb-10 flex items-end justify-between">
            <div>
              {subtitle && (
                <p className="luxury-subheading">{subtitle}</p>
              )}
              {title && <h2 className="luxury-heading mt-2">{title}</h2>}
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                className="rounded-full"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                className="rounded-full"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4 md:gap-6">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 grow-0 basis-[calc(50%-8px)] sm:basis-[calc(33.333%-16px)] lg:basis-[calc(25%-18px)]"
              >
                <ProductCard product={product} priority={i < 4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
