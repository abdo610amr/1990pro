"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Search, TrendingUp, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { catalogApi } from "@/lib/api-client";
import { useCatalog } from "@/providers/catalog-provider";
import { TRENDING_SEARCHES } from "@/lib/constants";
import { useSearchStore } from "@/store/recent-store";
import { formatPrice } from "@/lib/format";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { products, brands, collections } = useCatalog();
  const [query, setQuery] = useState("");
  const { recentSearches, addSearch, clearSearches } = useSearchStore();
  const productSearch = useQuery({
    queryKey: ["catalog", "search", query.trim()],
    queryFn: () => catalogApi.searchProducts({ q: query.trim(), limit: 100 }),
    enabled: query.trim().length > 0,
  });

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], brands: [], collections: [] };
    const q = query.toLowerCase();
    return {
      products: products
        .filter((product) =>
          productSearch.data?.items.some(
            (result) => String(result.id) === product.id
          )
        )
        .slice(0, 6),
      brands: brands.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.story.toLowerCase().includes(q)
      ).slice(0, 4),
      collections: collections.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      ).slice(0, 3),
    };
  }, [query, products, brands, collections, productSearch.data]);

  const handleSelect = (term: string) => {
    addSearch(term);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setQuery("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="top-[10%] max-h-[80vh] translate-y-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, collections..."
            className="h-12 pl-10 text-base"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[60vh] pr-4">
          {!query.trim() ? (
            <div className="space-y-6 py-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Recent Searches
                    </span>
                    <button
                      onClick={clearSearches}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <Link
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        onClick={() => handleSelect(term)}
                      >
                        <Badge variant="secondary" className="cursor-pointer">
                          {term}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="mb-3 flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Trending
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      onClick={() => handleSelect(term)}
                    >
                      <Badge variant="outline" className="cursor-pointer">
                        {term}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {results.products.length > 0 && (
                <div>
                  <h4 className="mb-3 text-xs tracking-wider uppercase text-muted-foreground">
                    Products
                  </h4>
                  <div className="space-y-2">
                    {results.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => handleSelect(product.name)}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                      >
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.brandName}
                          </p>
                        </div>
                        <span className="text-sm">{formatPrice(product.price)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.brands.length > 0 && (
                <div>
                  <h4 className="mb-3 text-xs tracking-wider uppercase text-muted-foreground">
                    Brands
                  </h4>
                  <div className="space-y-2">
                    {results.brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        onClick={() => handleSelect(brand.name)}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{brand.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {brand.story}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.collections.length > 0 && (
                <div>
                  <h4 className="mb-3 text-xs tracking-wider uppercase text-muted-foreground">
                    Collections
                  </h4>
                  <div className="space-y-2">
                    {results.collections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.slug}`}
                        onClick={() => handleSelect(col.name)}
                        className="block rounded-lg p-2 transition-colors hover:bg-secondary"
                      >
                        <p className="text-sm font-medium">{col.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {col.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 &&
                results.brands.length === 0 &&
                results.collections.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No results found for &ldquo;{query}&rdquo;</p>
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => handleSelect(query)}
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      View all search results
                    </Link>
                  </div>
                )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
