"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/shared/product-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageTransition } from "@/components/shared/page-transition";
import { ShopFilters, SortSelect } from "@/components/shop/shop-filters";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductGridSkeleton } from "@/components/shared/loading-skeleton";
import { catalogApi } from "@/lib/api-client";
import { useCatalog } from "@/providers/catalog-provider";
import type { ProductFilters, ProductType } from "@/types";

const ITEMS_PER_PAGE = 12;

export function ShopContent() {
  const { products, categories, brands, isLoading, error } = useCatalog();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ProductType | null;
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");

  const [activeTab, setActiveTab] = useState<ProductType>(
    tabParam === "showroom" ? "showroom" : "originals"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({
    type: activeTab,
    category: categoryParam ?? undefined,
    sort: (sortParam as ProductFilters["sort"]) ?? "newest",
  });

  const handleTabChange = (tab: string) => {
    const type = tab as ProductType;
    setActiveTab(type);
    setFilters((f) => ({ ...f, type }));
    setCurrentPage(1);
  };

  const categoryId = categories.find(
    (category) => category.slug === filters.category
  )?.id;
  const productQuery = useQuery({
    queryKey: [
      "catalog",
      "shop",
      activeTab,
      filters,
      categoryId,
      currentPage,
    ],
    queryFn: () =>
      catalogApi.searchProducts({
        categoryId,
        brandId: filters.brand,
        productType: activeTab,
        availability: filters.availability,
        size: filters.size,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
  });
  const resultIds = new Set(
    (productQuery.data?.items ?? []).map((product) => String(product.id))
  );
  const paginatedProducts = products.filter((product) =>
    resultIds.has(product.id)
  );
  const totalProducts = productQuery.data?.total ?? 0;
  const totalPages = productQuery.data?.totalPages ?? 0;
  const catalogError =
    productQuery.error instanceof Error ? productQuery.error.message : error;

  return (
    <PageTransition>
      <div className="luxury-container luxury-section">
        <PageBreadcrumb items={[{ label: "Shop" }]} />

        <div className="mb-10">
          <p className="luxury-subheading">Discover</p>
          <h1 className="luxury-heading mt-2">Shop</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Explore official 1990 Originals or discover curated premium local
            brands in our Showroom.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="h-12 rounded-full bg-secondary p-1">
            <TabsTrigger
              value="originals"
              className="rounded-full px-8 data-active:bg-primary data-active:text-primary-foreground"
            >
              Originals
            </TabsTrigger>
            <TabsTrigger
              value="showroom"
              className="rounded-full px-8 data-active:bg-primary data-active:text-primary-foreground"
            >
              Showroom
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-8 lg:flex-row">
          <ShopFilters
            filters={filters}
            categories={categories}
            brands={brands}
            products={products}
            onFilterChange={(f) => {
              setFilters(f);
              setCurrentPage(1);
            }}
            productCount={totalProducts}
          />

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalProducts} products
              </p>
              <SortSelect
                value={filters.sort}
                onChange={(sort) =>
                  setFilters((f) => ({ ...f, sort: sort as ProductFilters["sort"] }))
                }
              />
            </div>

            {isLoading || productQuery.isLoading ? (
              <ProductGridSkeleton />
            ) : catalogError ? (
              <EmptyState
                title="Unable to load products"
                description={catalogError}
                actionLabel="Try Again"
                actionHref="/shop"
              />
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or browse a different category."
                actionLabel="Clear Filters"
                actionHref="/shop"
              />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
