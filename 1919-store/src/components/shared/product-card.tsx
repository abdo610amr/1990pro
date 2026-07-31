"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addToCart = useCartStore((s) => s.addItem);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes.find((s) => s.inStock)?.label ?? "M";
    const selectedVariant = product.sizes.find(
      (size) => size.label === defaultSize
    );
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
    toast.success(
      isInWishlist ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn("group", className)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            className="image-zoom object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                New
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                -{discount}%
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm"
              onClick={handleWishlist}
              aria-label="Add to wishlist"
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isInWishlist && "fill-primary text-primary"
                )}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <span className="text-sm font-medium tracking-wider uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-xs tracking-wider text-muted-foreground uppercase">
            {product.brandName}
          </p>
          <h3 className="text-sm font-medium leading-tight">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
