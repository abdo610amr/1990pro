"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistStore {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
  sync: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        if (!get().isInWishlist(productId)) {
          set((state) => ({ items: [...state.items, { productId }] }));
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      toggleItem: (productId) => {
        if (get().isInWishlist(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      getCount: () => get().items.length,

      sync: async () => {},
    }),
    { name: "1990-wishlist" }
  )
);
