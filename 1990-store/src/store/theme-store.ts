"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  preference: ThemeMode;
  setPreference: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preference: "light",
      setPreference: (mode) => set({ preference: mode }),
    }),
    { name: "1990-theme" }
  )
);
