"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api-client";
import {
  adaptBrands,
  adaptCategories,
  adaptProducts,
  categoriesToCollections,
} from "@/lib/catalog-adapter";
import type { Brand, Category, Collection, Product } from "@/types";

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const productsQuery = useQuery({
    queryKey: ["catalog", "products"],
    queryFn: catalogApi.products,
    refetchInterval: 15_000,
  });
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: catalogApi.categories,
    refetchInterval: 30_000,
  });
  const brandsQuery = useQuery({
    queryKey: ["catalog", "brands"],
    queryFn: catalogApi.brands,
    refetchInterval: 30_000,
  });
  const reviewsQuery = useQuery({
    queryKey: ["catalog", "reviews"],
    queryFn: catalogApi.reviews,
    refetchInterval: 30_000,
  });

  const value = useMemo<CatalogContextValue>(() => {
    const backendProducts = productsQuery.data ?? [];
    const backendCategories = categoriesQuery.data ?? [];
    const backendBrands = brandsQuery.data ?? [];
    const error =
      productsQuery.error ??
      categoriesQuery.error ??
      brandsQuery.error ??
      reviewsQuery.error;

    return {
      products: adaptProducts(
        backendProducts,
        backendCategories,
        backendBrands,
        reviewsQuery.data ?? []
      ),
      categories: adaptCategories(backendCategories, backendProducts),
      brands: adaptBrands(backendBrands),
      collections: categoriesToCollections(
        backendCategories,
        backendProducts
      ),
      isLoading:
        productsQuery.isLoading ||
        categoriesQuery.isLoading ||
        brandsQuery.isLoading ||
        reviewsQuery.isLoading,
      error: error instanceof Error ? error.message : null,
      refresh: async () => {
        await Promise.all([
          productsQuery.refetch(),
          categoriesQuery.refetch(),
          brandsQuery.refetch(),
          reviewsQuery.refetch(),
        ]);
      },
    };
  }, [productsQuery, categoriesQuery, brandsQuery, reviewsQuery]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
}
