"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedStore {
  productIds: string[];
  addProduct: (productId: string) => void;
  getProducts: () => string[];
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addProduct: (productId) => {
        set((state) => {
          const filtered = state.productIds.filter((id) => id !== productId);
          return { productIds: [productId, ...filtered].slice(0, 10) };
        });
      },

      getProducts: () => get().productIds,
    }),
    { name: "1990-recently-viewed" }
  )
);

interface SearchStore {
  recentSearches: string[];
  addSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      recentSearches: [],

      addSearch: (query) => {
        if (!query.trim()) return;
        set((state) => {
          const filtered = state.recentSearches.filter(
            (s) => s.toLowerCase() !== query.toLowerCase()
          );
          return { recentSearches: [query, ...filtered].slice(0, 8) };
        });
      },

      clearSearches: () => set({ recentSearches: [] }),
    }),
    { name: "1990-search" }
  )
);
