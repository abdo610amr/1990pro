import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { SearchBar } from "@/components/shop/SearchBar";
import { FiltersSidebar } from "@/components/shop/FiltersSidebar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";
import { getLowestPrice, extractAvailableSizes, productHasSize } from "@/lib/utils";
import type { SortOption } from "@/types/product";

const PAGE_SIZE = 12;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = usePlatformConfig();
  const { data: products, loading, error, refetch } = useAsyncData(productService.getAll);
  const { data: categories } = useAsyncData(categoryService.getAll);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(() => {
    const cat = searchParams.get("category");
    if (!cat || !categories) return [];
    const match = categories.find((c) => c.slug === cat);
    return match ? [match.id] : [];
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && categories?.length) {
      const match = categories.find((c) => c.slug === cat);
      if (match) setSelectedCategoryIds([match.id]);
    }
  }, [searchParams, categories]);

  const priceBounds = useMemo(() => {
    if (!products?.length) return { min: 0, max: 500 };
    const prices = products.map(getLowestPrice);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  useEffect(() => {
    if (products?.length) {
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
  }, [priceBounds.min, priceBounds.max, products?.length]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const availableSizes = useMemo(
    () => (products ? extractAvailableSizes(products) : []),
    [products]
  );

  const filtered = useMemo(() => {
    if (!products) return [];

    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategoryIds.length > 0) {
      result = result.filter(
        (p) => p.categoryId != null && selectedCategoryIds.includes(p.categoryId)
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        selectedSizes.some((size) => productHasSize(p, size))
      );
    }

    result = result.filter((p) => {
      const price = getLowestPrice(p);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, search, selectedCategoryIds, selectedSizes, priceRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategoryIds, selectedSizes, priceRange, sort]);

  const handleCategoryToggle = useCallback(
    (categoryId: number) => {
      setSelectedCategoryIds((prev) => {
        const next = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId];
        const slug = categories?.find((c) => c.id === categoryId)?.slug;
        if (slug && next.includes(categoryId)) {
          setSearchParams({ category: slug });
        } else if (next.length === 0) {
          setSearchParams({});
        }
        return next;
      });
    },
    [categories, setSearchParams]
  );

  const handleSizeToggle = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((value) => value !== size) : [...prev, size]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategoryIds([]);
    setSelectedSizes([]);
    setSearch("");
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSearchParams({});
  }, [priceBounds.min, priceBounds.max, setSearchParams]);

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Shop</h1>
        <p className="mt-1 text-muted-foreground">
          {config?.shopSubtitle ?? "Explore our collection"}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} className="sm:max-w-md" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium lg:hidden"
          >
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <div className={`${showMobileFilters ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-56`}>
          <FiltersSidebar
            categories={categories ?? []}
            selectedCategoryIds={selectedCategoryIds}
            onCategoryToggle={handleCategoryToggle}
            minPrice={priceBounds.min}
            maxPrice={priceBounds.max}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onClear={clearFilters}
            enableSizeFilter={config?.enableSizeFilter}
            availableSizes={availableSizes}
            selectedSizes={selectedSizes}
            onSizeToggle={handleSizeToggle}
            sizeFilterLabel={config?.variantLabel ?? "Size"}
          />
        </div>

        <div className="flex-1">
          {loading && <ProductGridSkeleton />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && paginated.length === 0 && (
            <EmptyState
              title="No products found"
              message="Try adjusting your search or filters."
              actionLabel="Clear filters"
              actionHref="/shop"
            />
          )}
          {!loading && !error && paginated.length > 0 && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                {paginated.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
