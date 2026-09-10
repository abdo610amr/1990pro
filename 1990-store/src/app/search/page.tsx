import { Suspense } from "react";
import { SearchContent } from "@/components/search/search-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Search",
  description: "Search products, brands, and collections at 1990.",
};

function SearchFallback() {
  return (
    <div className="luxury-container luxury-section space-y-6">
      <Skeleton className="mx-auto h-12 max-w-2xl rounded-full" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
