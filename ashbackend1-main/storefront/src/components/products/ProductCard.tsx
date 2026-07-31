import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types/product";
import { formatCurrency, getLowestPrice, getProductVariants } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const variants = getProductVariants(product);
  const lowestPrice = getLowestPrice(product);
  const hasMultiplePrices = variants.length > 1;
  const hasOptions = variants.length > 1;
  const isSoldOut = product.stockStatus === "sold_out";
  const isLowStock = product.stockStatus === "low_stock";
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = variants[0];
    if (!variant || variant.stock <= 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      size: variant.label,
      price: variant.price,
      quantity: 1,
      coverImage: product.coverImage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_22px_50px_-20px_color-mix(in_oklch,var(--foreground)_35%,transparent)]",
        isSoldOut && "opacity-75",
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.coverImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* gradient veil for legibility + depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {isSoldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm font-bold uppercase tracking-wider backdrop-blur-[2px]">
            Sold Out
          </span>
        )}
        {product.tags.includes("bestseller") && !isSoldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
            Bestseller
          </span>
        )}
        {product.tags.includes("new") && !isSoldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-sidebar-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-primary-foreground shadow-sm">
            New
          </span>
        )}
        {isLowStock && !isSoldOut && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            Low Stock
          </span>
        )}

        {/* Quick action — slides up on hover (desktop), always tappable on touch */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={hasOptions ? undefined : handleQuickAdd}
            className={cn(
              "absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-xl bg-background/95 px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition-all duration-300",
              "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
              "max-md:translate-y-0 max-md:opacity-100",
              added && "bg-primary text-primary-foreground"
            )}
            aria-label={hasOptions ? "View options" : "Add to bag"}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : hasOptions ? (
              <>
                <SlidersHorizontal className="h-4 w-4" />
                Choose Options
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to Bag
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-sm font-semibold text-foreground">
            {hasMultiplePrices && <span className="text-muted-foreground">From </span>}
            {formatCurrency(lowestPrice)}
          </p>
          {product.tags.length > 0 && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.tags[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
