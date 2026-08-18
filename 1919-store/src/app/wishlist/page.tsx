"use client";

import { useWishlistStore } from "@/store/wishlist-store";
import { getProductById } from "@/lib/catalog-utils";
import { useCatalog } from "@/providers/catalog-provider";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageTransition } from "@/components/shared/page-transition";

export default function WishlistPage() {
  const { products: catalogProducts } = useCatalog();
  const items = useWishlistStore((s) => s.items);
  const products = items
    .map((item) => getProductById(catalogProducts, item.productId))
    .filter(Boolean);

  if (products.length === 0) {
    return (
      <PageTransition>
        <div className="luxury-container luxury-section">
          <PageBreadcrumb items={[{ label: "Wishlist" }]} />
          <EmptyState
            title="Your wishlist is empty"
            description="Save items you love by clicking the heart icon on any product."
            actionLabel="Discover Products"
            actionHref="/shop"
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="luxury-container luxury-section">
        <PageBreadcrumb items={[{ label: "Wishlist" }]} />
        <h1 className="luxury-heading mb-10">
          Wishlist ({products.length})
        </h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product!.id} product={product!} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
