"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalReturn, ShiftSession } from "@/types/pos";

interface ShiftState {
  current: ShiftSession | null;
  history: ShiftSession[];
  returns: LocalReturn[];
  openShift: (input: {
    cashierName: string;
    role: string;
    openingCash: number;
  }) => void;
  recordSale: (input: {
    total: number;
    method: string;
  }) => void;
  closeShift: (closingCash: number, notes?: string) => ShiftSession | null;
  addReturn: (entry: LocalReturn) => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      current: null,
      history: [],
      returns: [],
      openShift: ({ cashierName, role, openingCash }) => {
        set({
          current: {
            id: `shift-${Date.now()}`,
            openedAt: new Date().toISOString(),
            cashierName,
            role,
            openingCash,
            salesCount: 0,
            salesTotal: 0,
            cashSales: 0,
            cardSales: 0,
            instapaySales: 0,
          },
        });
      },
      recordSale: ({ total, method }) => {
        const current = get().current;
        if (!current) return;
        const next = { ...current };
        next.salesCount += 1;
        next.salesTotal += total;
        if (method === "cash") next.cashSales += total;
        if (method === "card") next.cardSales += total;
        if (method === "instapay") next.instapaySales += total;
        if (method === "split") next.cashSales += total / 2;
        set({ current: next });
      },
      closeShift: (closingCash, notes) => {
        const current = get().current;
        if (!current) return null;
        const expectedCash = current.openingCash + current.cashSales;
        const closed: ShiftSession = {
          ...current,
          closedAt: new Date().toISOString(),
          closingCash,
          expectedCash,
          difference: closingCash - expectedCash,
          notes,
        };
        set((state) => ({
          current: null,
          history: [closed, ...state.history].slice(0, 50),
        }));
        return closed;
      },
      addReturn: (entry) =>
        set((state) => ({ returns: [entry, ...state.returns].slice(0, 100) })),
    }),
    { name: "1990-pos-shift" }
  )
);
