"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PosCartItem, PosProduct, SuspendedSale } from "@/types/pos";

interface CartState {
  items: PosCartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  promoCode: string;
  discount: number;
  lineDiscount: number;
  note: string;
  suspended: SuspendedSale[];
  addItem: (product: PosProduct, variantLabel: string, quantity?: number) => void;
  updateQty: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  setCustomer: (data: Partial<Pick<CartState, "customerName" | "customerEmail" | "customerPhone" | "customerAddress">>) => void;
  setPromo: (code: string, discount: number) => void;
  setLineDiscount: (amount: number) => void;
  clear: () => void;
  subtotal: () => number;
  total: () => number;
  suspend: (cashierName: string, note?: string) => void;
  resume: (id: string) => void;
  removeSuspended: (id: string) => void;
}

function makeKey(productId: number, variant: string) {
  return `${productId}:${variant}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: "Walk-in Guest",
      customerEmail: "guest@1990.store",
      customerPhone: "",
      customerAddress: "In-store purchase",
      promoCode: "",
      discount: 0,
      lineDiscount: 0,
      note: "",
      suspended: [],
      addItem: (product, variantLabel, quantity = 1) => {
        const variant =
          product.variants.find((item) => item.label === variantLabel) ??
          product.variants[0];
        if (!variant || variant.stock <= 0) return;
        const key = makeKey(product.id, variant.label);
        set((state) => {
          const existing = state.items.find((item) => item.key === key);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? {
                      ...item,
                      quantity: Math.min(item.stock, item.quantity + quantity),
                    }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                key,
                productId: product.id,
                name: product.name,
                image: product.coverImage,
                variant: variant.label,
                size: variant.label,
                unitPrice: Number(variant.price),
                quantity: Math.min(variant.stock, quantity),
                stock: variant.stock,
                sku: variant.sku,
                discount: 0,
              },
            ],
          };
        });
      },
      updateQty: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.key === key
                ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((item) => item.key !== key) })),
      setCustomer: (data) => set(data),
      setPromo: (promoCode, discount) => set({ promoCode, discount }),
      setLineDiscount: (lineDiscount) => set({ lineDiscount: Math.max(0, lineDiscount) }),
      clear: () =>
        set({
          items: [],
          promoCode: "",
          discount: 0,
          lineDiscount: 0,
          note: "",
          customerName: "Walk-in Guest",
          customerEmail: "guest@1990.store",
          customerPhone: "",
          customerAddress: "In-store purchase",
        }),
      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity - item.discount,
          0
        ),
      total: () =>
        Math.max(0, get().subtotal() - get().discount - get().lineDiscount),
      suspend: (cashierName, note) => {
        const state = get();
        if (!state.items.length) return;
        const sale: SuspendedSale = {
          id: `hold-${Date.now()}`,
          createdAt: new Date().toISOString(),
          cashierName,
          items: state.items,
          customerName: state.customerName,
          customerEmail: state.customerEmail,
          customerPhone: state.customerPhone,
          promoCode: state.promoCode,
          discount: state.discount,
          note,
        };
        set({
          suspended: [sale, ...state.suspended],
          items: [],
          promoCode: "",
          discount: 0,
          lineDiscount: 0,
        });
      },
      resume: (id) => {
        const sale = get().suspended.find((item) => item.id === id);
        if (!sale) return;
        set((state) => ({
          items: sale.items,
          customerName: sale.customerName,
          customerEmail: sale.customerEmail,
          customerPhone: sale.customerPhone,
          promoCode: sale.promoCode,
          discount: sale.discount,
          suspended: state.suspended.filter((item) => item.id !== id),
        }));
      },
      removeSuspended: (id) =>
        set((state) => ({
          suspended: state.suspended.filter((item) => item.id !== id),
        })),
    }),
    { name: "1990-pos-cart" }
  )
);
