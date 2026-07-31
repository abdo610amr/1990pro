import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const theme = get().theme === "light" ? "dark" : "light";
        applyTheme(theme);
        set({ theme });
      },
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
    }),
    {
      name: "1990-admin-ui",
      partialize: ({ theme, sidebarCollapsed }) => ({
        theme,
        sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
