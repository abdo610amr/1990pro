"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { posApi } from "@/lib/api";
import type { PosRole } from "@/lib/permissions";
import type { PosUser } from "@/types/pos";

interface AuthState {
  token: string | null;
  user: PosUser | null;
  role: PosRole;
  hydrated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  displayName: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: "seller",
      hydrated: false,
      login: async (identifier, password) => {
        const result = await posApi.login(identifier, password);
        const userRole = (result.user.role?.toLowerCase() === "admin" ? "admin" : "seller") as PosRole;
        set({ token: result.token, user: result.user, role: userRole });
      },
      logout: () => set({ token: null, user: null, role: "seller" }),
      hydrate: async () => {
        const { token } = get();
        if (!token) {
          set({ hydrated: true });
          return;
        }
        try {
          const user = await posApi.me(token);
          const userRole = (user.role?.toLowerCase() === "admin" ? "admin" : "seller") as PosRole;
          set({ user, role: userRole, hydrated: true });
        } catch {
          set({ token: null, user: null, role: "seller", hydrated: true });
        }
      },
      displayName: () => {
        const { user, role } = get();
        if (!user) return role;
        if (user.full_name) return user.full_name;
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return name || user.username || user.email;
      },
    }),
    {
      name: "1990-pos-auth",
      partialize: ({ token, user, role }) => ({ token, user, role }),
      onRehydrateStorage: () => (state) => {
        void state?.hydrate();
      },
    }
  )
);
