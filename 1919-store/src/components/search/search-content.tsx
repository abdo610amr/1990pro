"use client";

import { useMemo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageTransition } from "@/components/shared/page-transition";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { catalogApi } from "@/lib/api-client";
import { useCatalog } from "@/providers/catalog-provider";
import { TRENDING_SEARCHES } from "@/lib/constants";
import { useSearchStore } from "@/store/recent-store";

export function SearchContent() {
  const { products, brands, collections } = useCatalog();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const { addSearch } = useSearchStore();
  const productSearch = useQuery({
    queryKey: ["catalog", "search", query.trim()],
    queryFn: () => catalogApi.searchProducts({ q: query.trim(), limit: 100 }),
    enabled: query.trim().length > 0,
  });

  useEffect(() => {
    if (query.trim()) addSearch(query.trim());
  }, [query, addSearch]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return { products: [], brands: [], collections: [] };
    }
    const q = query.toLowerCase();
    return {
      products: products.filter((product) =>
        productSearch.data?.items.some(
          (result) => String(result.id) === product.id
        )
      ),
      brands: brands.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.story.toLowerCase().includes(q) ||
          b.about.toLowerCase().includes(q)
      ),
      collections: collections.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      ),
    };
  }, [query, products, brands, collections, productSearch.data]);

  const hasResults =
    results.products.length > 0 ||
    results.brands.length > 0 ||
    results.collections.length > 0;

  return (
    <PageTransition>
      <div className="luxury-container luxury-section">
        <PageBreadcrumb items={[{ label: "Search" }]} />

        <div className="mx-auto mb-12 max-w-2xl">
          <h1 className="luxury-heading text-center">Search</h1>
          <div className="relative mt-6">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, collections..."
              className="h-12 rounded-full pl-11 text-base"
              autoFocus
            />
          </div>
        </div>

        {!query.trim() ? (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">Trending searches</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  onClick={() => setQuery(term)}
                >
                  <Badge variant="outline" className="cursor-pointer px-4 py-1.5">
                    {term}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ) : !hasResults ? (
          <EmptyState
            title={`No results for "${query}"`}
            description="Try different keywords or browse our shop."
            actionLabel="Browse Shop"
            actionHref="/shop"
          />
        ) : (
          <div className="space-y-12">
            {results.brands.length > 0 && (
              <section>
                <h2 className="mb-6 font-heading text-xl font-light">
                  Brands ({results.brands.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/showroom/${brand.slug}`}
                      className="flex items-center gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {brand.story}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.collections.length > 0 && (
              <section>
                <h2 className="mb-6 font-heading text-xl font-light">
                  Collections ({results.collections.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.collections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.slug}`}
                      className="rounded-2xl border p-6 transition-shadow hover:shadow-md"
                    >
                      <p className="font-medium">{col.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {col.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.products.length > 0 && (
              <section>
                <h2 className="mb-6 font-heading text-xl font-light">
                  Products ({results.products.length})
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                  {results.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
