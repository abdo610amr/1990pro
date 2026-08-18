"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { posApi } from "@/lib/api";
import type { OfflineQueuedOrder, PosProduct } from "@/types/pos";

interface OfflineState {
  online: boolean;
  catalog: PosProduct[];
  catalogUpdatedAt: string | null;
  queue: OfflineQueuedOrder[];
  setOnline: (online: boolean) => void;
  cacheCatalog: (products: PosProduct[]) => void;
  enqueueOrder: (payload: Record<string, unknown>) => string;
  syncQueue: () => Promise<{ synced: number; failed: number }>;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      online: true,
      catalog: [],
      catalogUpdatedAt: null,
      queue: [],
      setOnline: (online) => set({ online }),
      cacheCatalog: (products) =>
        set({
          catalog: products,
          catalogUpdatedAt: new Date().toISOString(),
        }),
      enqueueOrder: (payload) => {
        const id = `offline-${Date.now()}`;
        set((state) => ({
          queue: [
            {
              id,
              createdAt: new Date().toISOString(),
              payload,
              status: "queued",
            },
            ...state.queue,
          ],
        }));
        return id;
      },
      syncQueue: async () => {
        const pending = get().queue.filter(
          (item) => item.status === "queued" || item.status === "failed"
        );
        let synced = 0;
        let failed = 0;

        for (const item of pending) {
          set((state) => ({
            queue: state.queue.map((entry) =>
              entry.id === item.id ? { ...entry, status: "syncing" } : entry
            ),
          }));
          try {
            await posApi.createOrder(item.payload);
            synced += 1;
            set((state) => ({
              queue: state.queue.map((entry) =>
                entry.id === item.id
                  ? { ...entry, status: "synced", error: undefined }
                  : entry
              ),
            }));
          } catch (error) {
            failed += 1;
            set((state) => ({
              queue: state.queue.map((entry) =>
                entry.id === item.id
                  ? {
                      ...entry,
                      status: "failed",
                      error:
                        error instanceof Error
                          ? error.message
                          : "Sync failed",
                    }
                  : entry
              ),
            }));
          }
        }

        set((state) => ({
          queue: state.queue.filter((entry) => entry.status !== "synced"),
        }));

        return { synced, failed };
      },
    }),
    { name: "1990-pos-offline" }
  )
);
