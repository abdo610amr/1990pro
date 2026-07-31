"use client";

import { useWishlistStore } from "@/store/wishlist-store";
import { getProductById } from "@/lib/catalog-utils";
import { useCatalog } from "@/providers/catalog-provider";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";

export default function WishlistPage() {
  const { products: catalogProducts } = useCatalog();
  const items = useWishlistStore((s) => s.items);
  const products = items
    .map((item) => getProductById(catalogProducts, item.productId))
    .filter(Boolean);

  if (products.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save items you love by clicking the heart icon on any product."
        actionLabel="Discover Products"
        actionHref="/shop"
      />
    );
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-light mb-6">
        Wishlist ({products.length})
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product!.id} product={product!} />
        ))}
      </div>
    </div>
  );
}
