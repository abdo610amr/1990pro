import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/loading-skeleton";
import { ShopContent } from "@/components/shop/shop-content";

export const metadata = {
  title: "Shop",
  description: "Browse 1990 Originals and our curated selection of brands.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="luxury-container luxury-section">
        <ProductGridSkeleton />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
