"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "@/types";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

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
          const token = useAuthStore.getState().token;
          if (token) {
            void authApi.addWishlist(token, Number(productId)).catch(() => {
              set((state) => ({
                items: state.items.filter((item) => item.productId !== productId),
              }));
            });
          }
        }
      },

      removeItem: (productId) => {
        const previous = get().items;
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
        const token = useAuthStore.getState().token;
        if (token) {
          void authApi.removeWishlist(token, Number(productId)).catch(() => {
            set({ items: previous });
          });
        }
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

      sync: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        const productIds = await authApi.wishlist(token);
        set({ items: productIds.map((id) => ({ productId: String(id) })) });
      },
    }),
    { name: "1990-wishlist" }
  )
);
