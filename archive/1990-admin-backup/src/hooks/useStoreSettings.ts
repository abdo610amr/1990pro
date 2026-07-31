import { useContext } from "react";
import { StoreSettingsContext } from "@/providers/StoreSettingsProvider";
import type { HeroBannerConfig, LogoConfig, StoreSettings } from "@/types/store-settings";

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);

  if (!context) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }

  return context;
}

/** Convenience selectors — keeps components decoupled from settings shape */
export function useStoreName(): string {
  return useStoreSettings().settings?.storeName ?? "Store";
}

export function useStoreTagline(): string {
  return useStoreSettings().settings?.tagline ?? "";
}

export function useLogoConfig(): LogoConfig | null {
  return useStoreSettings().settings?.logo ?? null;
}

export function useHeroBanner(): HeroBannerConfig | null {
  return useStoreSettings().settings?.heroBanner ?? null;
}

export function useBrandId(): string {
  return useStoreSettings().settings?.brandId ?? "default";
}

export function useThemeSettings(): StoreSettings["theme"] | null {
  return useStoreSettings().settings?.theme ?? null;
}
