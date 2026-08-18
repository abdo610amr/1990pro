"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
  index?: number;
}

export function CategoryCard({ category, className, index = 0 }: CategoryCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.12);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 4) * 100}ms` }}
      className={cn("reveal group", visible && "is-visible", className)}
    >
      <Link href={`/shop?category=${category.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary border border-border">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h3 className="display text-xl uppercase text-primary">{category.name}</h3>
            <p className="label mt-1 text-[10px] text-wine/70">
              {category.productCount} Products
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
