"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useReveal } from "@/hooks/use-reveal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
  priority?: boolean;
}

export function ProductCard({ product, className, index = 0, priority }: ProductCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.12);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addToCart = useCartStore((s) => s.addItem);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes.find((s) => s.inStock)?.label ?? "M";
    const selectedVariant = product.sizes.find((s) => s.label === defaultSize);
    const defaultColor = product.colors[0]?.name ?? "Default";
    addToCart({
      productId: product.id,
      quantity: 1,
      size: defaultSize,
      color: defaultColor,
      name: product.name,
      image: product.images[0],
      unitPrice: selectedVariant?.price ?? product.price,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  const tagLabel = product.isNew
    ? "New"
    : discount > 0
    ? `-${discount}%`
    : product.isBestSeller
    ? "Best Seller"
    : null;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 4) * 120}ms` }}
      className={cn("reveal group", visible && "is-visible", className)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />

          {tagLabel && (
            <span className="label absolute left-4 top-4 bg-background/85 px-2 py-1 text-primary backdrop-blur-sm z-10">
              {tagLabel}
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-primary backdrop-blur-sm transition-transform hover:scale-110"
          >
            <Heart className={cn("h-4 w-4", isInWishlist && "fill-primary text-primary")} />
          </button>

          {!product.inStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm z-10">
              <span className="label text-primary">Sold Out</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="label absolute bottom-0 left-0 right-0 translate-y-full bg-primary py-3 text-center text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 z-20"
            >
              Add to Cart
            </button>
          )}
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
          <div>
            <h3 className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-primary">
              {product.name}
            </h3>
            <p className="label mt-1 text-[10px] text-wine/60">{product.brandName}</p>
          </div>
          <span className="text-sm font-semibold text-wine/80 font-mono">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>
    </div>
  );
}
