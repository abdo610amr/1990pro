"use client";

import Link from "next/link";
import Image from "next/image";
import type { Brand } from "@/types";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  className?: string;
  index?: number;
}

export function BrandCard({ brand, className, index = 0 }: BrandCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.12);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 3) * 120}ms` }}
      className={cn("reveal group", visible && "is-visible", className)}
    >
      <Link href={`/brands/${brand.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary border border-border">
          <Image
            src={brand.coverImage || brand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop"}
            alt={brand.name}
            fill
            className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
            <div className="flex items-center gap-3">
              {brand.logo && (
                <div className="relative h-10 w-10 overflow-hidden border border-border bg-background p-1 shrink-0">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h3 className="display text-xl uppercase text-primary">{brand.name}</h3>
                <p className="label mt-1 text-[10px] text-wine/70 line-clamp-1">
                  {brand.story || brand.about || brand.description || "Official Brand"}
                </p>
              </div>
            </div>
            <span className="label text-[10px] text-primary border border-primary px-3 py-1.5 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              View →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
