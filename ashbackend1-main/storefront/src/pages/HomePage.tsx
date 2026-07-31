import { useAsyncData } from "@/hooks/useAsyncData";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";
import { HomePopup } from "@/components/popup/HomePopup";
import { HomeSections } from "@/components/home/HomeSections";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";

export function HomePage() {
  const { config, loading: platformLoading } = usePlatformConfig();
  const { data: products, loading, error, refetch } = useAsyncData(productService.getAll);
  const { data: categories } = useAsyncData(categoryService.getAll);

  if (platformLoading || !config) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <HomePopup />
      <HomeSections
        config={config}
        products={products}
        categories={categories}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}
