"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { SHIPPING_COST, TAX_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { commerceApi } from "@/lib/api-client";

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, email?: string) => Promise<boolean>;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.size === item.size &&
                i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.size === size && i.color === color)
          ),
        }));
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: async (code, email) => {
        try {
          const items = get().items;
          const result = await commerceApi.applyPromo({
            code,
            email,
            totalAmount: get().getSubtotal(),
            cartItems: items.map((item) => ({
              size: item.size,
              quantity: item.quantity,
              price: item.unitPrice ?? 0,
            })),
          });
          set({
            couponCode: result.promo ?? code.toLowerCase(),
            couponDiscount: result.discount ?? 0,
          });
          return true;
        } catch {
          return false;
        }
      },

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + (item.unitPrice ?? 0) * item.quantity,
          0
        );
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        return (subtotal - discount) * TAX_RATE;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        return subtotal - discount + get().getShipping() + get().getTax();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    { name: "1990-cart" }
  )
);
